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

func decodeJwt(bearer string) (*JwtClaims, error) {
	_, claims, err := DecodeJwt(bearer)
	if err != nil {
		return nil, err
	}
	return claims, err
}

func isAllowed(permissions []string, claims *JwtClaims) bool {
	if permissions != nil && len(permissions) != 0 && len(lo.Intersect[string](permissions, claims.Permissions)) == 0 {
		return false
	}
	return true
}

func RequireAuth(next httprouter.Handle, permissions []string) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		bearer := extractToken(r)
		if bearer == "" {
			utils.WriteErrorResponse(w, http.StatusUnauthorized, "Invalid token")
			return
		}
		claims, err := decodeJwt(bearer)
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
