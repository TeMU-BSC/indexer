export interface Article {
    id?: string,
    title?: string,
    abstractText?: string,
    addedBy?: Annotator['id'],
    descriptores?: Descriptor[]
}

/**
 * DeCS acronym stands for 'Descriptor de Ciencias de la Salud'. To avoid the
 * possible misunderstanding between the singular and the plural of DeCS due to
 * its final 's' of its acronym, the interface has been named 'Descriptor', and
 * its plural should be 'descriptores'.
 */
export interface Descriptor {
    decsCode?: string,
    termSpanish?: string,
    termEnglish?: string,
    meshCode?: string,
    synonyms?: string,
    treeNumber?: string,
    definitionSpanish?: string,
    definitionLatin?: string,

    addedOn: string
}

export interface Annotator {
    id?: string,
    name?: string
}
