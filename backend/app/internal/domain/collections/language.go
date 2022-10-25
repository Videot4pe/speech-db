package collections

type Language struct {
	Id   uint16 `json:"id" sql:"id"`
	Name string `json:"name" sql:"name"`
}
