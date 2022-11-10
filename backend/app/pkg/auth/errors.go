package auth

import "errors"

var ErrInvalidToken = errors.New("Invalid token")
var ErrExpiredToken = errors.New("Token expired")

func IsError(err0 error, err1 error) bool {
	return err0.Error() == err1.Error()
}
