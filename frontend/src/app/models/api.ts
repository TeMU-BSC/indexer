// export interface User {
//   fullname: string
//   email: string
//   role: string
//   password: string
// }

// export interface Document {
//   identifier: string
//   title: string
//   abstract: string
//   source: string
//   type: string
// }
// export interface Term {
//   code: string
//   term: string
//   terminology: string
// }

// export interface Indexing {
//   document_identifier: Document['identifier']
//   user_email: User['email']
//   term_code: Term['code']
// }


import { User } from 'src/app/models/user'
import { Descriptor, Doc } from './decs'

export interface Annotation {
  decsCode: Descriptor['decsCode']
  doc: Doc['id']
  user: User['id']
}

export interface ApiResponse {
  success?: boolean
  message?: string
  user?: User
  registeredUsers?: number
  deletedCount?: number
  suggestions?: any
  validatedDecsCodes?: Descriptor['decsCode'][]
}

export interface PaginatedResponse {
  items: any[]
  page: number
  perPage: number
  total: number
}
