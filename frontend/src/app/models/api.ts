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
