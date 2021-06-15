export interface User {
  fullname: string
  email: string
  role: 'annotator' | 'admin' | 'validator'
  password: string
  assigned_document_identifiers?: string[]
}

export interface Document {
  identifier: string
  title: string
  abstract: string
  source: string
  type: string
  terms?: Term[]
  completed?: Boolean
  validated?: Boolean
  user_email?: User['email']
}
export interface Term {
  terminology: string
  code: string
  name: string
  description: string
  synonyms: string[]
}

export interface Annotation {
  document_identifier: Document['identifier']
  identifier: string
  user_email: User['email']
  term_code: string
}

export interface Validation {
  document_identifier: Document['identifier']
  identifier: string
  user_email: User['email']
  validator_email: User['email']
  term_code: string
}

export interface ValidationTime {
  identifier: string,
  document: Document['identifier'],
  annotator_email: User['email'],
  validator_email: User['email'],
  opened_first_time:  Date,
  validate: boolean,
  validated_time: Date
}

export interface FormConfig {
  label: string
  hint: string
  buttonName: string
  color: string
  action: string
}

export interface ApiResponse {
  data?: any
  message?: string
  success?: boolean
}

export interface PaginatedResponse {
  items: any[]
  page: number
  perPage: number
  total: number
}