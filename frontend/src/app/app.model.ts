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
// export class Descriptor {
//   decsCode?: string

//   // Attributes for HTTP requests
//   articleId?: Article['id']
//   addedBy?: Annotator['id']
//   addedOn?: number
//   removedBy?: Annotator['id']
//   removedOn?: number

//   // Attributes for filtering
//   termSpanish?: string
//   termEnglish?: string
//   meshCode?: string
//   synonyms?: string
//   treeNumber?: string
//   definitionSpanish?: string
//   definitionLatin?: string
// }
export class Descriptor {
  // Attributes for HTTP requests
  articleId?: Article['id']
  addedBy?: Annotator['id']
  addedOn?: number
  removedBy?: Annotator['id']
  removedOn?: number

  constructor(
    public decsCode?: string,
    public termSpanish?: string,
    public termEnglish?: string,
    public meshCode?: string,
    public synonyms?: string,
    public treeNumber?: string,
    public definitionSpanish?: string,
    public definitionLatin?: string
  ) { }
}

export interface IDescriptorResponse {
  total: number
  results: Descriptor[]
}
