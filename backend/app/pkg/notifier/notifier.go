package notifier

import (
	"backend/pkg/logging"
	"github.com/julienschmidt/httprouter"
	"github.com/julienschmidt/sse"
	"sync"
)

type Notifier struct {
	streamer *sse.Streamer
	logger   *logging.Logger
}

var instance *Notifier
var once sync.Once

func GetNotifier() *Notifier {
	return instance
}

func (n *Notifier) Register(router *httprouter.Router, logger *logging.Logger, path string) {
	once.Do(func() {
		streamer := sse.New()
		router.Handler("GET", path, streamer)

		instance = &Notifier{
			streamer: streamer,
			logger:   logger,
		}
	})
}

func (n *Notifier) Notify(action string, status string, payload interface{}) error {
	return n.streamer.SendJSON("", "notification", Notification[interface{}]{
		Action:  action,
		Status:  status,
		Payload: payload,
	})
}

func (n *Notifier) Success(action string, payload interface{}) error {
	n.logger.Infof("NOTIFY: %", payload)
	return n.streamer.SendJSON("", "notification", Notification[interface{}]{
		Action:  action,
		Status:  StatusSuccess,
		Payload: payload,
	})
}

func (n *Notifier) Error(action string, payload interface{}) error {
	return n.streamer.SendJSON("", "notification", Notification[interface{}]{
		Action:  action,
		Status:  StatusError,
		Payload: payload,
	})
}
