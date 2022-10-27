export interface Language {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface Phoneme {
  id: number;
  value: string;
  isVowel: boolean;
}

export interface Collections {
  countries: Country[];
  languages: Language[];
  phonemes: Phoneme[];
}
