export class User {
  id?: string
  name?: string
  email: string
  password?: string
  passwordConfirm?: string
}

export class Article {
  // tslint:disable-next-line: variable-name
  id?: string
  title?: string
  abstractText?: string
  descriptors?: string[] // Remove after discard old versions 1 and 2 in app.component
}

/**
 * DeCS acronym stands for 'Descriptor de Ciencias de la Salud'. To avoid the
 * possible misunderstanding between the singular and the plural of DeCS due to
 * its final 's' of its acronym, the class has been named 'Descriptor', and
 * its plural should be 'descriptors'.
 */
export class Descriptor {
  decsCode?: string

  // Attributes for POST HTTP requests
  addedBy?: User['id']
  addedOn?: number
  addedTo?: Article['id']

  // Attributes for DELETE HTTP requests
  removedBy?: User['id']
  removedOn?: number
  removedFrom?: Article['id']

  // Attributes for filtering
  termSpanish?: string
  termEnglish?: string
  meshCode?: string
  synonyms?: string
  treeNumber?: string
  definitionSpanish?: string
  definitionLatin?: string
}
