import { Component, OnInit } from '@angular/core'
import { AuthenticationService } from 'src/app/services/auth.service'
import { Router } from '@angular/router'
import { User } from 'src/app/app.model'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user: User = new User()
  users: User[]
  selectedFile: File

  constructor(
    public auth: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  register(user: User) {
    this.auth.registerOne(user).subscribe(response => console.log(response))
  }

  bulkRegister() {
    this.auth.registerMany(this.users).subscribe(response => console.log(response))
  }

  /**
   * Set the users attribute to bulk register all of these users.
   * @param event JSON file upload
   */
  onFileChange(event) {
    this.selectedFile = event.target.files[0]
    const fileReader = new FileReader()
    fileReader.readAsText(this.selectedFile, 'UTF-8')
    fileReader.onloadend = () => this.users = JSON.parse(fileReader.result as string)
    fileReader.onerror = error => console.error(error)
  }

}
