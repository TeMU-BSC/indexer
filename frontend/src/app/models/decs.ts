export interface Descriptor {
  decsCode: string
  termSpanish?: string
  termEnglish?: string
  meshCode?: string
  synonyms?: string
  treeNumber?: string
  definitionSpanish?: string
  definitionLatin?: string
  new?: boolean
}

export interface Doc {
  identifier: string
  title?: string
  abstract?: string
  decsCodes?: Descriptor['decsCode'][]
  completed?: boolean
  validatedDecsCodes?: Descriptor['decsCode'][]
  validated?: boolean
}
