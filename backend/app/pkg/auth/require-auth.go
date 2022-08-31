package auth

import (
	"backend/pkg/utils"
	"context"
	"fmt"
	"github.com/julienschmidt/httprouter"
	"github.com/samber/lo"
	"net/http"
	"strings"
)

func RequireAuth(next httprouter.Handle, permissions []string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		authHeader := r.Header.Get("Authorization")
		bearer := strings.Replace(authHeader, "Bearer ", "", 1)
		_, claims, err := DecodeJwt(bearer)
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusForbidden, err.Error())
			return
		}
		fmt.Printf("%v %v", permissions, len(permissions))
		// permissions НЕ пустые и нет пересечений
		if permissions != nil && len(permissions) != 0 && len(lo.Intersect[string](permissions, claims.Permissions)) == 0 {
			utils.WriteErrorResponse(w, http.StatusMethodNotAllowed, "Not allowed")
			return
		}
		r = r.WithContext(context.WithValue(r.Context(), "userId", claims.Id))
		//r = r.WithContext(context.WithValue(r.Context(), "permissions", claims.Permissions))
		next(w, r, ps)
	}
}
