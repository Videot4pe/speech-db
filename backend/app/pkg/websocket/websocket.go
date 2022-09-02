package websocket

import (
	"backend/pkg/logging"
	"github.com/gorilla/websocket"
)

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

type Websocket struct {
	logger *logging.Logger
}
