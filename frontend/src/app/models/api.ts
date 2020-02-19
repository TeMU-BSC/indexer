import {User} from 'src/app/models/user'

export interface ApiResponse {
  success?: boolean
  message?: string
  user?: User
  registeredUsers?: number
  deletedCount?: number
  suggestions?: any
}
