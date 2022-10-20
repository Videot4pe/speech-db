package notifier

const (
	StatusSuccess = "success"
	StatusError   = "error"
)

type Notification[T any] struct {
	Action  string `json:"action"`
	Status  string `json:"status"`
	Payload T      `json:"payload"`
}
