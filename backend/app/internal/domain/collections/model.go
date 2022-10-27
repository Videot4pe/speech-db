package collections

type Collection struct {
	Countries []Country  `json:"countries"`
	Languages []Language `json:"languages"`
	Phonemes  []Phoneme  `json:"phonemes"`
}
