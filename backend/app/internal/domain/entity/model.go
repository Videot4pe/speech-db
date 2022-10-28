package entity

import "time"

type Entity struct {
	Id         uint16    `json:"id" sql:"id"`
	MarkupId   uint16    `json:"markupId" sql:"markup_id"`
	Value      string    `json:"value" sql:"value"`
	Type       string    `json:"type" sql:"type"`
	BeginTime  float64   `json:"beginTime" sql:"begin_time"`
	EndTime    float64   `json:"endTime" sql:"end_time"`
	CreatedAt  time.Time `json:"createdAt" sql:"created_at"`
	Properties struct {
		StressId   uint16 `json:"stressId" sql:"stress_id"`
		LanguageId uint16 `json:"languageId" sql:"language_id"`
		Dialect    string `json:"dialect" sql:"dialect"`
	} `json:"properties" sql:"properties"`
}
