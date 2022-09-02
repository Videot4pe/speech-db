package records

import (
	"backend/internal/domain/files"
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
)

type Handler struct {
	logger       *logging.Logger
	storage      *Storage
	s3Client     *s3.Client
	filesStorage *files.Storage
	ctx          context.Context
}

const (
	listURL = "/api/records"
	viewURL = "/api/records/:recordId"
)

func NewRecordsHandler(ctx context.Context, storage *Storage, filesStorage *files.Storage, s3Client *s3.Client, logger *logging.Logger) *Handler {
	return &Handler{
		storage:      storage,
		s3Client:     s3Client,
		filesStorage: filesStorage,
		logger:       logger,
		ctx:          ctx,
	}
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(listURL, auth.RequireAuth(h.All, nil))
	router.GET(viewURL, auth.RequireAuth(h.View, nil))
	router.POST(listURL, auth.RequireAuth(h.Create, []string{}))
	router.PATCH(listURL, auth.RequireAuth(h.Update, []string{}))
}

func (h *Handler) All(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	userId := r.Context().Value("userId").(uint16)

	pagination, err := model.NewPagination(r)
	sorts, err := model.NewSorts(r)
	filters, err := model.NewFilters(r)
	h.logger.Trace(filters)

	records, meta, err := h.storage.All(userId, filters, pagination, sorts...)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, utils.MetaData{
		Data: records,
		Meta: meta,
	})
}

func (h *Handler) View(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := r.Context().Value("userId").(uint16)
	user, err := h.storage.GetById(id)

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, user)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var record NewRecord
	userId := r.Context().Value("userId").(uint16)

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &record); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	_, name, err := h.s3Client.UploadBase64(h.ctx, record.File)
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
	record.FileId = &fileId

	record.CreatedBy = userId
	id, err := h.storage.Create(record)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusCreated, id)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id := r.Context().Value("userId").(uint16)

	var record NewRecord
	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &record); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	err = h.storage.Update(uint16(id), record)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, id)
}
