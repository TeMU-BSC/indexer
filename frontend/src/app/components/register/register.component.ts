import { Component, OnInit } from '@angular/core'
import { AuthenticationService } from 'src/app/services/auth.service'
import { Router } from '@angular/router'
import { User } from 'src/app/app.model'
import { MatSnackBar } from '@angular/material'

interface Response {
  registeredUsers?: number
  errorMessage?: string
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  user: User = new User()
  users: User[]
  selectedFile: File
  response: Response

  constructor(
    public auth: AuthenticationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  registerOne(user: User) {
    this.auth.registerOne(user).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => this.snackBar.open(`Usuario registrado correctamente`, 'OK', { duration: 10000 })
    )
  }

  registerMany() {
    this.auth.registerMany(this.users).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => {
        if (this.response.errorMessage) {
          this.snackBar.open(`Error al registrar usuarios: ${this.response.errorMessage}`, 'Revisaré el fichero JSON')
        } else {
          this.snackBar.open(`Usuarios registrados: ${this.response.registeredUsers}`, 'OK', { duration: 10000 })
        }
      }
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
