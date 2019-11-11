import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Annotator } from 'src/app/app.model'
import { AppService } from 'src/app/app.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  annotator: Annotator = new Annotator()

  constructor(private router: Router, private appService: AppService) { }

  login(): void {
    // this.router.navigate(['home'])
    const loggedIn = this.appService.login(this.annotator)
    if (loggedIn) {
      alert('Login')
      console.log(loggedIn)
    }
  }

}
