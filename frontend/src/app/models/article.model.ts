export interface Article {
    id?: string,
    title?: string,
    abstractText?: string,
    decsCodes?: string[],
    annotatorId?: string
}

export interface DecsCode {
    id?: string,
    timestamp?: string
}
