package roles

type Role struct {
	Id          uint16   `json:"id" sql:"id"`
	Name        string   `json:"name" sql:"name"`
	Permissions []string `json:"permissions"`
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

	CreateMarkups     = "CREATE_MARKUPS"
	ReadAllMarkups    = "READ_ALL_MARKUPS"
	ReadMarkups       = "READ_MARKUPS"
	UpdateAllMarkups  = "UPDATE_ALL_MARKUPS"
	UpdateMarkups     = "UPDATE_MARKUPS"
	DeleteAllMarkups  = "DELETE_ALL_MARKUPS"
	DeleteMarkups     = "DELETE_MARKUPS"
	CreateRecords     = "CREATE_RECORDS"
	ReadAllRecords    = "READ_ALL_RECORDS"
	ReadRecords       = "READ_RECORDS"
	UpdateAllRecords  = "UPDATE_ALL_RECORDS"
	UpdateRecords     = "UPDATE_RECORDS"
	DeleteAllRecords  = "DELETE_ALL_RECORDS"
	DeleteRecords     = "DELETE_RECORDS"
	CreateSpeakers    = "CREATE_SPEAKERS"
	ReadAllSpeakers   = "READ_ALL_SPEAKERS"
	ReadSpeakers      = "READ_SPEAKERS"
	UpdateAllSpeakers = "UPDATE_ALL_SPEAKERS"
	UpdateSpeakers    = "UPDATE_SPEAKERS"
	DeleteAllSpeakers = "DELETE_ALL_SPEAKERS"
	DeleteSpeakers    = "DELETE_SPEAKERS"
	CreateUsers       = "CREATE_USERS"
	ReadAllUsers      = "READ_ALL_USERS"
	ReadUsers         = "READ_USERS"
	UpdateAllUsers    = "UPDATE_ALL_USERS"
	UpdateUsers       = "UPDATE_USERS"
	DeleteAllUsers    = "DELETE_ALL_USERS"
	DeleteUsers       = "DELETE_USERS"
	CreateRoles       = "CREATE_ROLES"
	ReadAllRoles      = "READ_ALL_ROLES"
	ReadRoles         = "READ_ROLES"
	UpdateAllRoles    = "UPDATE_ALL_ROLES"
	UpdateRoles       = "UPDATE_ROLES"
	DeleteAllRoles    = "DELETE_ALL_ROLES"
	DeleteRoles       = "DELETE_ROLES"
	CanBreathe        = "CAN_BREATHE"
	ExMachina         = "EX_MACHINA"
)
