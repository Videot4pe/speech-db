package records

import (
	waveform_generator "backend/internal/client/waveform-generator"
	"backend/internal/config"
	"backend/internal/domain/files"
	"backend/internal/domain/roles"
	"backend/pkg/auth"
	"backend/pkg/client/postgresql/model"
	"backend/pkg/client/s3"
	"backend/pkg/logging"
	notifier2 "backend/pkg/notifier"
	"backend/pkg/utils"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
)

type Handler struct {
	logger         *logging.Logger
	config         *config.Config
	storage        *Storage
	waveformClient *waveform_generator.WaveformGeneratorClient
	s3Client       *s3.Client
	filesStorage   *files.Storage
	ctx            context.Context
}

const (
	listURL          = "/api/records"
	viewURL          = "/api/records/:recordId"
	setImageURL      = "/api/records/set-image/:recordId"
	generateImageURL = "/api/records/generate/:recordId"
)

func NewRecordsHandler(ctx context.Context, config *config.Config, storage *Storage, filesStorage *files.Storage, waveformClient *waveform_generator.WaveformGeneratorClient, s3Client *s3.Client, logger *logging.Logger) *Handler {
	return &Handler{
		storage:        storage,
		config:         config,
		s3Client:       s3Client,
		filesStorage:   filesStorage,
		waveformClient: waveformClient,
		logger:         logger,
		ctx:            ctx,
	}
}

var getListUrlRoles = []string{
	roles.CreateRecords,
	roles.ReadRecords,
	roles.ReadAllRecords,
	roles.UpdateRecords,
	roles.UpdateAllRecords,
	roles.DeleteRecords,
	roles.DeleteAllRecords,
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(listURL, auth.RequireAuth(h.All, getListUrlRoles))
	router.GET(viewURL, auth.RequireAuth(h.View, nil))
	router.POST(listURL, auth.RequireAuth(h.Create, nil))
	router.PATCH(listURL, auth.RequireAuth(h.Update, nil))
	router.POST(generateImageURL, auth.RequireAuth(h.Generate, nil))
	router.POST(setImageURL, h.SetImage)
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
	recordId, err := strconv.ParseUint(ps.ByName("recordId"), 16, 16)
	record, err := h.storage.GetById(recordId)

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, record)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var record NewRecord
	userId := r.Context().Value("userId").(uint16)

	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(&record); err != nil {
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

	callbackUrl := fmt.Sprintf("%v/api/records/set-image/%v", h.config.Listen.ServerIP, id)
	go h.waveformClient.SendAudioUrl(url, callbackUrl)
	// TODO IF ERR SET CRON

	utils.WriteResponse(w, http.StatusCreated, id)
}

type ImageFile struct {
	Image string `json:"image"`
}

func (h *Handler) Generate(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	recordId, err := strconv.ParseUint(ps.ByName("recordId"), 10, 64)
	record, err := h.storage.GetById(recordId)

	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	callbackUrl := fmt.Sprintf("%v/api/records/set-image/%v", h.config.Listen.ServerIP, recordId)
	go h.waveformClient.SendAudioUrl(record.File, callbackUrl)
}

func (h *Handler) SetImage(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	var file ImageFile
	recordId, err := strconv.ParseUint(ps.ByName("recordId"), 10, 64)
	if err != nil {
		//notifier.Error("Image generation error", err.Error())
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		//notifier.Error("Image generation error", err.Error())
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &file); err != nil {
		//notifier.Error("Image generation error", err.Error())
		h.logger.Error("error decoding response: %v", err)
		if e, ok := err.(*json.SyntaxError); ok {
			h.logger.Error("syntax error at byte offset %d", e.Offset)
		}
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	_, name, err := h.s3Client.UploadBase64(h.ctx, file.Image)
	if err != nil {
		//notifier.Error("Image generation error", err.Error())
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	url, err := h.s3Client.GetFile(h.ctx, name)
	if err != nil {
		//notifier.Error("Image generation error", err.Error())
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	fileId, err := h.filesStorage.Create(url, name)
	if err != nil {
		//notifier.Error("Image generation error", err.Error())
		h.logger.Error(err)
		return
	}

	err = h.storage.SetImage(recordId, fileId)

	if err != nil {
		//notifier.Error("Image generation error", err.Error())
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	notifier := notifier2.GetNotifier()
	notifier.Success("Record is ready", fmt.Sprintf("Layout for record %d was successfully created", recordId))

	utils.WriteResponse(w, http.StatusCreated, nil)
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
