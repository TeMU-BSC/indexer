import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user: User = new User()

  constructor(
    private auth: AuthenticationService,
    private router: Router
  ) { }

  login() {
    this.auth.login(this.user).subscribe(
      () => this.router.navigateByUrl('/'),
      (error) => console.error(error)
    )
  }

  // login(): void {
  //   // this.router.navigate(['home'])
  //   const loggedIn = this.appService.login(this.annotator)
  //   if (loggedIn) {
  //     alert('Login')
  //     console.log(loggedIn)
  //   }
  // }



}
