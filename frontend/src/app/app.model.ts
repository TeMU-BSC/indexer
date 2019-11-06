export class Annotator {
  id?: string
  name?: string
  password?: string
}

export class Article {
  id?: string
  title?: string
  abstractText?: string
  descriptors?: Descriptor[] // Remove after discard old versions 1 and 2 in app.component
}

/**
 * DeCS acronym stands for 'Descriptor de Ciencias de la Salud'. To avoid the
 * possible misunderstanding between the singular and the plural of DeCS due to
 * its final 's' of its acronym, the class has been named 'Descriptor', and
 * its plural should be 'descriptors'.
 */
export class Descriptor {
  id?: string
  termSpanish?: string
  termEnglish?: string
  meshCode?: string
  synonyms?: string
  treeNumber?: string
  definitionSpanish?: string
  definitionLatin?: string

  addedBy?: Annotator['id']
  addedOn?: number
}
