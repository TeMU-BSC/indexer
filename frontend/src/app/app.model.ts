export class User {
  id?: string
  fullname?: string
  email?: string
  password?: string
  passwordConfirm?: string
}

export class Doc {
  id?: string
  title?: string
  abstract?: string
  decsCodes?: string[]
  completed?: boolean
}

/**
 * DeCS acronym stands for 'Descriptor de Ciencias de la Salud'. To avoid the
 * possible misunderstanding between the singular and the plural of DeCS due to
 * its final 's' of its acronym, the class has been named 'Descriptor', and
 * its plural should be 'descriptors'.
 */
export class Descriptor {
  decsCode?: string

  // Attributes for filtering
  termSpanish?: string
  termEnglish?: string
  meshCode?: string
  synonyms?: string
  treeNumber?: string
  definitionSpanish?: string
  definitionLatin?: string
}

export interface BackendResponse {
  success?: boolean
  loggedUser?: User
  registeredUsers?: number
  errorMessage?: string
}
