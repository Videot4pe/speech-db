package records

import (
	"time"
)

type Record struct {
	Id        uint16    `json:"id" sql:"id"`
	Name      string    `json:"name" sql:"name"`
	Speaker   string    `json:"speaker" sql:"speaker"`
	File      string    `json:"file" sql:"file"`
	Image     *string   `json:"image" sql:"image"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
	CreatedBy uint16    `json:"createdBy" sql:"created_by"`
}

type NewRecord struct {
	Id        uint16    `json:"id" sql:"id"`
	Name      string    `json:"name" sql:"name"`
	Speaker   uint16    `json:"speaker" sql:"speaker_id"`
	File      string    `json:"file"`
	FileId    *uint16   `json:"fileId" sql:"file_id"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
	CreatedBy uint16    `json:"createdBy" sql:"created_by"`
}
