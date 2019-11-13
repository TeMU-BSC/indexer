import { Component, OnInit } from '@angular/core'
import { AuthenticationService } from 'src/app/services/auth.service'
import { Router } from '@angular/router'
import { User } from 'src/app/app.model'
import { MatSnackBar } from '@angular/material'

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
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  register(user: User) {
    this.auth.registerOne(user).subscribe(
      response => this.user = response,
      error => console.error(error),
      () => this.snackBar.open(`Usuario registrado correctamente`, 'OK', { duration: 10000 })
    )
  }

  bulkRegister() {
    this.auth.registerMany(this.users).subscribe(
      response => this.users = response,
      error => console.error(error),
      () => this.snackBar.open(`Usuarios registrados correctamente: ${this.users.length}`, 'OK', { duration: 10000 })
    )
  }

  /**
   * Set the users attribute to bulk register all of these users.
   * @param event JSON file upload
   */
  onFileSelected(event) {
    this.selectedFile = event.target.files[0]
    const fileReader = new FileReader()
    fileReader.readAsText(this.selectedFile, 'UTF-8')
    fileReader.onloadend = () => this.users = JSON.parse(fileReader.result as string)
    fileReader.onerror = error => console.error(error)
  }

}
