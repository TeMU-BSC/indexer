export interface Article {
    id?: string,
    title?: string,
    abstractText?: string,
    descriptores?: Descriptor[]
}

/**
 * DeCS acronym stands for 'Descriptor de Ciencias de la Salud'. To avoid the
 * possible misunderstanding between the singular and the plural of DeCS due to
 * its final 's' of its acronym, the interface has been named 'Descriptor', and
 * its plural should be 'descriptores'.
 */
export interface Descriptor {
    id: string,
    description?: {
        en: string,
        es: string
    },
    synonyms?: {
        en: string,
        es: string
    }
    addedBy?: Annotator['id'],
    addedOn?: string
}

export interface Annotator {
    id?: string,
    name?: string
}
