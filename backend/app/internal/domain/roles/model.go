package roles

type Role struct {
	Id          uint16       `json:"id" sql:"id"`
	Name        string       `json:"name" sql:"name"`
	Permissions []Permission `json:"permissions"`
}

type Permission struct {
	Id   uint16 `json:"id" sql:"id"`
	Name string `json:"name" sql:"name"`
}

const (
	EditSpeakers = "EDIT_SPEAKERS"
	EditMarkups  = "EDIT_MARKUPS"
	EditRecords  = "EDIT_RECORDS"
	EditUsers    = "EDIT_USERS"
)
