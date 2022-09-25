package auth

import (
	"backend/pkg/utils"
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
	"github.com/samber/lo"
)

func extractToken(r *http.Request) (bearer string) {
	authHeader := r.Header.Get("Authorization")
	bearer = strings.Replace(authHeader, "Bearer ", "", 1)

	fmt.Printf("header: %v", bearer)
	if bearer == "" {
		queryValues := r.URL.Query()
		bearer = queryValues.Get("token")
		fmt.Printf("header: %v", bearer)
	}
	return bearer
}

func isAllowed(permissions []string, claims *AuthJwt) bool {
	return !(permissions != nil &&
		len(permissions) != 0 &&
		len(lo.Intersect[string](permissions, claims.Data.Permissions)) == 0)
}

func RequireAuth(next httprouter.Handle, permissions []string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		bearer := extractToken(r)
		if bearer == "" {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid token")
			return
		}
		_, claims, err := Decode(&AuthJwt{}, bearer)
		if err != nil {
			utils.WriteErrorResponse(w, http.StatusForbidden, err.Error())
			return
		}
		allowed := isAllowed(permissions, claims)
		if !allowed {
			utils.WriteErrorResponse(w, http.StatusMethodNotAllowed, "Not allowed")
			return
		}
		r = r.WithContext(context.WithValue(r.Context(), "userId", claims.Id))
		next(w, r, ps)
	}
}
