package entity

import "time"

type Entity struct {
	Id        uint16    `json:"id" sql:"id"`
	MarkupId  uint16    `json:"markupId" sql:"markup_id"`
	Value     string    `json:"value" sql:"value"`
	BeginTime float64   `json:"beginTime" sql:"begin_time"`
	EndTime   float64   `json:"endTime" sql:"end_time"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
}
