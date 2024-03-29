package speakers

import (
	"backend/internal/domain/roles"
	"backend/pkg/auth"
	"backend/pkg/client/postgresql/model"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	logger  *logging.Logger
	storage *Storage
	ctx     context.Context
}

const (
	speakersURL = "/api/speakers"
	speakerURL  = "/api/speakers/:speakerId"
)

func NewSpeakersHandler(ctx context.Context, storage *Storage, logger *logging.Logger) *Handler {
	return &Handler{
		storage: storage,
		logger:  logger,
		ctx:     ctx,
	}
}

var getListUrlRoles = []string{
	roles.CreateSpeakers,
	roles.ReadSpeakers,
	roles.ReadAllSpeakers,
	roles.UpdateSpeakers,
	roles.UpdateAllSpeakers,
	roles.DeleteSpeakers,
	roles.DeleteAllSpeakers,
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(speakersURL, auth.RequireAuth(h.All, getListUrlRoles))
	router.GET(speakerURL, auth.RequireAuth(h.View, nil))
	router.POST(speakersURL, auth.RequireAuth(h.Create, []string{roles.CreateSpeakers}))
	router.PATCH(speakerURL, auth.RequireAuth(h.Update, []string{roles.UpdateSpeakers, roles.UpdateAllSpeakers}))
}

func (h *Handler) All(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	userId := r.Context().Value("userId").(uint16)

	pagination, err := model.NewPagination(r)
	sorts, err := model.NewSorts(r)
	filters, err := model.NewFilters(r)
	h.logger.Trace(filters)

	speakers, meta, err := h.storage.All(userId, filters, pagination, sorts...)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, utils.MetaData{
		Data: speakers,
		Meta: meta,
	})
}

func (h *Handler) View(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	//userId := r.Context().Value("userId").(uint16)
	id, err := strconv.ParseUint(ps.ByName("speakerId"), 10, 64)
	speaker, err := h.storage.GetById(uint16(id))

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, speaker)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var speaker Speaker
	userId := r.Context().Value("userId").(uint16)

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &speaker); err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	speaker.CreatedBy = userId
	id, err := h.storage.Create(speaker)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusCreated, id)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := r.Context().Value("userId").(uint16)

	var speaker Speaker
	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &speaker); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	err = h.storage.Update(speaker)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, id)
}
