package collections

type Phoneme struct {
	Id      uint16 `json:"id" sql:"id"`
	Value   string `json:"value" sql:"value"`
	IsVowel bool   `json:"isVowel" sql:"is_vowel"`
}
