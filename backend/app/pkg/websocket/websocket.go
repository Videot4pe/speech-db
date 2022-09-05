package websocket

import (
	"backend/pkg/logging"
	"encoding/json"
	"github.com/gorilla/websocket"
	"github.com/julienschmidt/httprouter"
	"net/http"
)

type Message struct {
	MessageType int         `json:"type"`
	Data        interface{} `json:"data"`
}

/*
clients - соединения
init - функция высшего порядка, возвращает функцию, вызываемую при соединении
read - функция, вызываемая при новом сообщении
write - функция, вызываемая при отправке сообщения
*/

type Websocket struct {
	upgrader websocket.Upgrader
	logger   *logging.Logger
	clients  map[*websocket.Conn]bool
	init     func(_ http.ResponseWriter, _ *http.Request, ps httprouter.Params) func(ws *Websocket) error
	read     func(message []byte) error
	write    func(ws Websocket, messageType int, message interface{}) error
}

func New(
	logger *logging.Logger,
	init func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) func(ws *Websocket) error,
	read func(message []byte) error,
	write func(ws Websocket, messageType int, message interface{}) error,
) *Websocket {
	return &Websocket{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		logger:  logger,
		clients: make(map[*websocket.Conn]bool, 0),
		init:    init,
		read:    read,
		write:   write,
	}
}

func (ws *Websocket) Connect(w http.ResponseWriter, r *http.Request, ps httprouter.Params) error {
	connection, err := ws.upgrader.Upgrade(w, r, nil)
	if err != nil {
		ws.logger.Error(err)
		return err
	}
	defer connection.Close()

	ws.clients[connection] = true
	defer delete(ws.clients, connection)

	// TODO fix closure (?)
	err = ws.init(w, r, ps)(ws)
	if err != nil {
		ws.logger.Error(err)
		return err
	}

	for {
		mt, message, err := connection.ReadMessage()

		if err != nil || mt == websocket.CloseMessage {
			ws.logger.Error(err)
			return err
		}

		go ws.read(message)
	}
}

func (ws *Websocket) Write(messageType int, data interface{}) error {

	// TODO реализовать messageType enum

	message := &Message{
		MessageType: messageType,
		Data:        data,
	}
	byteData, err := json.Marshal(message)
	if err != nil {
		ws.logger.Error(err)
		return err
	}
	for conn := range ws.clients {
		err := conn.WriteMessage(websocket.TextMessage, byteData)
		if err != nil {
			ws.logger.Error(err)
			return err
		}
	}
	return nil
}
