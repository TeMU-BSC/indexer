import { Component } from '@angular/core'
import { User } from 'src/app/app.model'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user: User = new User()

  constructor(
    public auth: AuthenticationService,
  ) { }

  login() {
    this.auth.login(this.user)
  }

}
