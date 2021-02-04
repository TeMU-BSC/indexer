import { Component, Inject } from '@angular/core'
import { User } from 'src/app/models/user'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string
  password: string

  constructor(
    public auth: AuthService,
  ) { }

}
