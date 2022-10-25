package collections

import (
	"backend/pkg/auth"
	"backend/pkg/logging"
	"backend/pkg/utils"
	"context"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type Handler struct {
	logger  *logging.Logger
	storage *Storage
	ctx     context.Context
}

const (
	collectionsURL = "/api/collections"
)

func NewHandler(ctx context.Context, storage *Storage, logger *logging.Logger) *Handler {
	return &Handler{
		logger:  logger,
		storage: storage,
		ctx:     ctx,
	}
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(collectionsURL, auth.RequireAuth(h.All, nil))
}

func (h *Handler) All(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	countries, err := h.storage.Countries()
	languages, err := h.storage.Languages()

	// TODO fix
	if err != nil {
		return
	}

	collection := Collection{
		Countries: countries,
		Languages: languages,
	}

	utils.WriteResponse(w, http.StatusOK, collection)
}
