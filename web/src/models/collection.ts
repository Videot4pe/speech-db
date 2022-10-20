export interface Language {
  id: number;
  name: string;
}

export interface Country {
  id: number;
  name: string;
}

export interface Collections {
  countries: Country[];
  languages: Language[];
}
