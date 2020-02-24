/**
 * DeCS acronym stands for 'Descriptor de Ciencias de la Salud'. To avoid the
 * possible misunderstanding between the singular and the plural of DeCS due to
 * its final 's' of its acronym, the class has been named 'Descriptor', and
 * its plural should be 'descriptors'.
 */
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
  id: string
  title?: string
  abstract?: string
  decsCodes?: Descriptor['decsCode'][]
  completed?: boolean
  validated?: boolean
  suggestions?: Descriptor['decsCode'][]
  validatedDecsCodes?: Descriptor['decsCode'][]
}
