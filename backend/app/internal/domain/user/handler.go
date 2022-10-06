package user

import (
	"backend/internal/domain/roles"
	"backend/pkg/auth"
	"backend/pkg/client/postgresql/model"
	"backend/pkg/client/s3"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"encoding/json"
	"github.com/julienschmidt/httprouter"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
)

type Handler struct {
	logger       *logging.Logger
	storage      *Storage
	filesStorage FilesStorage
	s3Client     *s3.Client
	ctx          context.Context
}

type FilesStorage interface {
	Create(path string, name string) (uint16, error)
	GetById(id uint16) (string, error)
}

const (
	usersURL = "/api/users"
	userURL  = "/api/users/:userId"
)

func NewUserHandler(ctx context.Context, storage *Storage, logger *logging.Logger, filesStorage FilesStorage, s3Client *s3.Client) *Handler {
	return &Handler{
		filesStorage: filesStorage,
		logger:       logger,
		storage:      storage,
		s3Client:     s3Client,
		ctx:          ctx,
	}
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(usersURL, auth.RequireAuth(h.List, []string{roles.EditUsers}))
	router.GET(userURL, auth.RequireAuth(h.View, []string{roles.EditUsers}))
	router.PATCH(userURL, auth.RequireAuth(h.Update, []string{roles.EditUsers}))
	router.DELETE(usersURL, auth.RequireAuth(h.Delete, []string{roles.EditUsers}))
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	pagination, err := model.NewPagination(r)
	sorts, err := model.NewSorts(r)
	filters, err := model.NewFilters(r)
	h.logger.Trace(filters)

	users, meta, err := h.storage.List(filters, pagination, sorts...)

	// TODO Перенести в сервис (а лучше добавить прослойку manager)
	for index, user := range users {
		if user.AvatarId != nil {
			avatarPath, err := h.filesStorage.GetById(*user.AvatarId)
			if err != nil {
				h.logger.Error(err)
				return
			}
			user.Avatar = &avatarPath
			users[index] = user
		}
	}

	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, utils.MetaData{
		Data: users,
		Meta: meta,
	})
}

func (h *Handler) View(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id, err := strconv.ParseUint(ps.ByName("userId"), 16, 16)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	user, err := h.storage.GetById(uint16(id))

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

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var user User

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

	userId, _, err := h.storage.Create(user, false)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusCreated, userId)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id, err := strconv.ParseUint(ps.ByName("userId"), 16, 16)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	var user User

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

	err = h.storage.Update(uint16(id), user)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, id)
}

func (h *Handler) Delete(w http.ResponseWriter, _ *http.Request, ps httprouter.Params) {
	id, err := strconv.ParseUint(ps.ByName("userId"), 16, 16)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	err = h.storage.Delete(uint16(id))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, id)
}
