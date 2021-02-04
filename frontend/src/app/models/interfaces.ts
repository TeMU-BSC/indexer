export interface User {
  fullname: string
  email: string
  role: string
  password: string
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
}
export interface Term {
  code: string
  term: string
  definition?: string
  terminology: string
}

export interface Indexing {
  document_identifier: Document['identifier']
  user_email: User['email']
  term: Term
}

export interface FormConfig {
  label: string
  hint: string
  buttonName: string
  color: string
  action: string
}

export interface ApiResponse {
  success?: boolean
  message?: string
  user?: User
  registeredUsers?: number
  deletedCount?: number
  suggestions?: any
  validatedTermCodes?: Term['code'][]
}

export interface PaginatedResponse {
  items: any[]
  page: number
  perPage: number
  total: number
}
