package markups

import (
	"backend/internal/domain/files"
	"backend/internal/domain/speakers"
	"time"
)

type Markup struct {
	Id        uint16           `json:"id" sql:"id"`
	Name      string           `json:"name" sql:"name"`
	Speaker   speakers.Speaker `json:"speaker"`
	File      files.File       `json:"file"`
	CreatedAt time.Time        `json:"createdAt" sql:"created_at"`
}

type Entity struct {
	Id         uint16    `json:"id" sql:"id"`
	Markup     Markup    `json:"markup"`
	Value      string    `json:"value" sql:"value"`
	BeginTime  time.Time `json:"beginTime" sql:"begin_time"`
	EndTime    time.Time `json:"endTime" sql:"end_time"`
	Properties struct {
	} `json:"properties" sql:"properties"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
}
