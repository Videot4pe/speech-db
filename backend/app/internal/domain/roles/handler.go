package roles

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
	permissionsURL = "/api/roles/permissions"
)

func NewRolesHandler(ctx context.Context, storage *Storage, logger *logging.Logger) *Handler {
	return &Handler{
		logger:  logger,
		storage: storage,
		ctx:     ctx,
	}
}

func (h *Handler) Register(router *httprouter.Router) {
	router.GET(permissionsURL, auth.RequireAuth(h.Permissions, nil))
}

func (h *Handler) Permissions(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	permissions, err := h.storage.Permissions()
	if err != nil {
		h.logger.Error(err)
		utils.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.WriteResponse(w, http.StatusOK, permissions)
}
