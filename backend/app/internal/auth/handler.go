package auth

import (
	"backend/internal/config"
	"backend/internal/domain/files"
	"backend/internal/domain/user"
	"backend/pkg/auth"
	"backend/pkg/client/s3"
	"backend/pkg/logging"
	"backend/pkg/mailer"
	"backend/pkg/utils"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
)

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Handler struct {
	logger       *logging.Logger
	storage      *user.Storage
	filesStorage *files.Storage
	s3Client     *s3.Client
	ctx          context.Context
	cfg          *config.Config
}

type AuthenticatePayload struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken"`
}

type ChangePasswordPayload struct {
	Password string `json:"password"`
}

const (
	signinURL         = "/api/auth/signin"
	signupURL         = "/api/auth/signup"
	selfURL           = "/api/auth/self"
	refreshURL        = "/api/auth/refresh"
	activateURL       = "/api/auth/activate/:hash"
	passwordResetURL  = "/api/auth/password-reset"
	changePasswordURL = "/api/auth/change-password"
)

func NewAuthHandler(ctx context.Context, storage *user.Storage, filesStorage *files.Storage, s3Client *s3.Client, logger *logging.Logger, cfg *config.Config) *Handler {
	return &Handler{
		logger:       logger,
		storage:      storage,
		filesStorage: filesStorage,
		s3Client:     s3Client,
		ctx:          ctx,
		cfg:          cfg,
	}
}

func (h *Handler) Register(router *httprouter.Router) {
	router.POST(signinURL, h.Signin)
	router.POST(signupURL, h.Signup)
	router.POST(refreshURL, h.Refresh)
	router.GET(activateURL, h.Activate)
	router.POST(passwordResetURL, h.PasswordReset)
	router.POST(changePasswordURL, h.ChangePassword)

	// TODO HELP ME WITH THIS FCKN SHIT PLEASE, I'M DEVASTATED AND COMPLETELY STUCK
	router.GET(selfURL, auth.RequireAuth(h.GetSelf, nil))
	router.PATCH(selfURL, auth.RequireAuth(h.UpdateSelf, nil))
}

func (h *Handler) Signin(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var credentials Credentials

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &credentials); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userId, isVerified, permissions, err := h.storage.GetByCredentials(credentials.Email, credentials.Password)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}
	if !isVerified {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "Not activated")
		return
	}

	jwtClaims := auth.AuthJwt{
		Data: auth.AuthJwtData{
			Email:       credentials.Email,
			Id:          userId,
			Permissions: permissions,
		},
	}
	token, err := auth.Encode(&jwtClaims, 10)

	refreshJwtClaims := auth.AuthJwt{
		Data: auth.AuthJwtData{
			Email:       token,
			Id:          userId,
			Permissions: permissions,
		},
	}
	refreshToken, err := auth.Encode(&refreshJwtClaims, 10)

	err = h.storage.UpdateRefreshToken(refreshToken, userId)

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, AuthenticatePayload{
		Token:        token,
		RefreshToken: refreshToken,
	})
}

func (h *Handler) GetSelf(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := r.Context().Value("userId").(uint16)
	user, err := h.storage.GetById(id)

	if user.AvatarId != nil {
		avatarPath, err := h.filesStorage.GetById(*user.AvatarId)
		if err != nil {
			h.logger.Error(err)
			return
		}
		user.Avatar = &avatarPath
	}

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, user)
}

func (h *Handler) UpdateSelf(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := r.Context().Value("userId").(uint16)

	var user user.User

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &user); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	// TODO сохранять картинки и рекорды в разные бакеты
	if user.Avatar != nil && *user.Avatar != "" && user.AvatarId == nil {
		_, name, err := h.s3Client.UploadBase64(h.ctx, *user.Avatar)
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		url, err := h.s3Client.GetFile(h.ctx, name)
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		fileId, err := h.filesStorage.Create(url, name)
		if err != nil {
			h.logger.Error(err)
			return
		}
		user.AvatarId = &fileId
	}

	err = h.storage.Update(id, user)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, id)
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var payload AuthenticatePayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userId, err := h.storage.IsRefreshTokenActual(payload.Token)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	if userId == 0 {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "Token is invalid")
		return
	}

	userInfo, err := h.storage.GetById(userId)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	jwtClaims := auth.AuthJwt{
		Data: auth.AuthJwtData{
			Id:    userId,
			Email: userInfo.Email,
		},
	}
	payload.Token, err = auth.Encode(&jwtClaims, 10)

	refreshJwtClaims := auth.AuthJwt{
		Data: auth.AuthJwtData{
			Id:    userId,
			Email: payload.Token,
		},
	}
	refreshToken, err := auth.Encode(&refreshJwtClaims, 10)

	err = h.storage.UpdateRefreshToken(refreshToken, userId)

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, AuthenticatePayload{
		Token:        payload.Token,
		RefreshToken: refreshToken,
	})
}

func (h *Handler) Signup(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var newUser user.User

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &newUser); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	// TODO Transaction (create & send mail)
	userId, token, err := h.storage.Create(newUser, false)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	cfg := config.GetConfig()

	authMailerClient := GetMailerAuth(cfg, h.logger)
	activationLink := fmt.Sprintf("%v:%v/api/auth/activate/%v", cfg.Listen.ServerIP, cfg.Listen.Port, token)

	emailConfirmationParams := EmailConfirmationParams{
		Name:  newUser.Name,
		Email: newUser.Email,
		Link:  activationLink,
	}

	err = authMailerClient.SendMail(newUser.Email, "Email confirmation", EmailConfirmationTemplate, emailConfirmationParams)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "Mail error")
		return
	}

	utils.WriteResponse(w, http.StatusOK, userId)
}

func (h *Handler) Activate(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	hash := ps.ByName("hash")
	err := h.storage.Activate(hash)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "Activation error")
		return
	}
	http.Redirect(w, r, fmt.Sprintf("%v/signin", h.cfg.Frontend.ServerIP), http.StatusTemporaryRedirect)
}

func (h *Handler) PasswordReset(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	// TODO проверить email на валидность - пока что, лишь бы не пустая строка
	email := strings.TrimSpace(string(body))
	if len(email) == 0 {
		errorText := fmt.Sprintf("Invalid email: '%v'", email)
		utils.WriteErrorResponse(w, http.StatusBadRequest, errorText)
		return
	}

	userId, isVerified, err := h.storage.GetByEmail(email)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}
	if !isVerified {
		utils.WriteErrorResponse(w, http.StatusUnauthorized, "Not activated")
		return
	}

	token, err := h.storage.PasswordReset(userId)

	cfg := config.GetConfig()
	sender := mailer.SenderConfig{
		Host:     cfg.Mailer.Host,
		Port:     cfg.Mailer.Port,
		Username: cfg.Mailer.Username,
		Password: cfg.Mailer.Password,
	}
	mailClient := mailer.GetMailer(sender, h.logger)
	activationLink := fmt.Sprintf("%v/change-password?token=%v", cfg.Frontend.ServerIP, token)

	mail := mailer.Mail{
		Username: email,
		Subject:  "Password reset",
		//Text:     result,
		Text: fmt.Sprintf("Pwd reset link: %v", activationLink),
	}
	err = mailClient.Send(mail)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "Mail error")
		return
	}

	utils.WriteResponse(w, http.StatusOK, userId)
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	queryValues := r.URL.Query()
	token := queryValues.Get("token")
	var payload ChangePasswordPayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "Password change error: "+err.Error())
		return
	}

	err = h.storage.ChangePassword(token, payload.Password)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, "Password change error: "+err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)
}
