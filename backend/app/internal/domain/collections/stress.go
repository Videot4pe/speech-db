package collections

type Stress struct {
	Id    uint16 `json:"id" sql:"id"`
	Value string `json:"value" sql:"value"`
}
