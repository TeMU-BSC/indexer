import { Component } from '@angular/core'
import { Router } from '@angular/router'
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
    private router: Router
  ) { }

  login() {
    this.auth.login(this.user).subscribe(
      // response => {
      //   if (response.token !== undefined) {
      //     this.auth.setCurrentUser(response)
      //   }
      // },
      // error => console.error(error),
      // () => {
      //   if (this.user.token !== undefined) {
      //     console.log(this.user)
      //     this.router.navigateByUrl('/')
      //   }
      // }

      () => {
        this.router.navigateByUrl('/home')
      }
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
