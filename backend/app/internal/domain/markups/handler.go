package markups

import (
	entity2 "backend/internal/domain/entity"
	"backend/pkg/auth"
	"backend/pkg/client/postgresql/model"
	"backend/pkg/logging"
	"backend/pkg/utils"
	websocket2 "backend/pkg/websocket"
	"context"
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/julienschmidt/httprouter"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
)

type Handler struct {
	logger        *logging.Logger
	storage       *Storage
	entityStorage *entity2.Storage
	ctx           context.Context
	clients       map[*websocket.Conn]bool
	ws            *websocket2.Websocket
}

const (
	listURL      = "/api/markups"
	viewURL      = "/api/markups/:markupId"
	websocketURL = "/api/ws/markups/:id"
)

const (
	ListEntity   = "LIST"
	CreateEntity = "CREATE"
	UpdateEntity = "UPDATE"
	RemoveEntity = "REMOVE"
)

func NewHandler(ctx context.Context, storage *Storage, entityStorage *entity2.Storage, logger *logging.Logger) *Handler {
	return &Handler{
		storage:       storage,
		entityStorage: entityStorage,
		logger:        logger,
		ctx:           ctx,
		clients:       make(map[*websocket.Conn]bool, 0),
	}
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(listURL, auth.RequireAuth(h.All, nil))
	router.GET(viewURL, auth.RequireAuth(h.View, nil))
	router.POST(listURL, auth.RequireAuth(h.Create, []string{}))
	router.POST(viewURL, auth.RequireAuth(h.Update, []string{}))
	// TODO AUTH!!!
	router.GET(websocketURL, h.Websocket)
}

func (h *Handler) All(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {

	// TODO self filter

	pagination, err := model.NewPagination(r)
	sorts, err := model.NewSorts(r)
	filters, err := model.NewFilters(r)

	params := model.NewParams(filters, sorts, pagination)

	list, meta, err := h.storage.All(params)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, utils.MetaData{
		Data: list,
		Meta: meta,
	})
}

func (h *Handler) View(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	id, err := strconv.ParseUint(ps.ByName("markupId"), 10, 64)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	markup, err := h.storage.GetById(uint16(id))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, markup)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var markup NewMarkup
	userId := r.Context().Value("userId").(uint16)

	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &markup); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	markup.CreatedBy = userId
	id, err := h.storage.Create(markup)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusCreated, id)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	id := r.Context().Value("userId").(uint16)

	var markup NewMarkup
	defer r.Body.Close()
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 1048576))
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := json.Unmarshal(body, &markup); err != nil {
		utils.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	err = h.storage.Update(uint16(id), markup)
	if err != nil {
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, id)
}

func (h *Handler) InitWebsocket(_ http.ResponseWriter, _ *http.Request, ps httprouter.Params) func(ws *websocket2.Websocket) error {
	id, err := strconv.ParseUint(ps.ByName("id"), 16, 16)
	if err != nil {
		h.logger.Error(err)
	}

	return func(ws *websocket2.Websocket) error {
		entities, _, err := h.entityStorage.All(uint16(id))
		if err != nil {
			h.logger.Error(err)
		}

		ws.Write(ListEntity, entities)
		return nil
	}
}

func (h *Handler) Write(ws websocket2.Websocket, action string, payload interface{}) error {
	err := ws.Write(action, payload)
	// TODO log
	return err
}

func (h *Handler) Read(message []byte) error {
	var payload websocket2.Message[entity2.Entity]
	err := json.Unmarshal(message, &payload)
	if err != nil {
		h.logger.Error(err)
		return err
	}
	h.logger.Println(payload)

	switch payload.Action {
	case CreateEntity:
		_, err = h.entityStorage.Create(payload.Payload)
	case UpdateEntity:
		_ = h.entityStorage.Update(payload.Payload.Id, payload.Payload)
	}

	if err != nil {
		h.logger.Error(err)
		return err
	}

	// TODO NIKOLAY - markup id брать из контекста!!! (не верить фронту)
	entities, _, err := h.entityStorage.All(uint16(payload.Payload.MarkupId))
	h.ws.Write(ListEntity, entities)

	return nil
}

func (h *Handler) Websocket(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	h.ws = websocket2.New(h.logger, h.InitWebsocket, h.Read, h.Write)
	err := h.ws.Connect(w, r, ps)
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
}
