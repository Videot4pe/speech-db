package speakers

import "time"

type Speaker struct {
	Id         uint16 `json:"id" sql:"id"`
	Name       string `json:"name" sql:"name"`
	Properties struct {
		Age int `json:"age" sql:"age"`
	} `json:"properties" sql:"properties"`
	CreatedAt time.Time `json:"createdAt" sql:"created_at"`
	CreatedBy uint16    `json:"createdBy" sql:"created_by"`
}
