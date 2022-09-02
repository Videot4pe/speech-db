package markups

import "time"

type Markup struct {
	Id        uint16    `json:"id" sql:"id"`
	Record    string    `json:"record"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
	CreatedBy string    `json:"createdBy" sql:"created_by"`
}

type NewMarkup struct {
	Id        uint16    `json:"id" sql:"id"`
	Record    uint16    `json:"record"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
	CreatedBy uint16    `json:"createdBy" sql:"created_by"`
}
