import { Component } from '@angular/core'
import { AuthService } from 'src/app/services/auth.service'
import { User, ApiResponse } from 'src/app/app.model'
import { MatSnackBar } from '@angular/material'
import { AppService } from 'src/app/services/app.service'
import * as EXAMPLE_USER from 'src/assets/examples/user.json'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  user: User = new User()
  users: User[]
  exampleUser: User = (EXAMPLE_USER as any).default
  selectedFile: File
  response: ApiResponse

  constructor(
    public auth: AuthService,
    private snackBar: MatSnackBar,
    public appService: AppService
  ) { }

  // registerOne(user: User) {
  //   this.auth.registerOne(user).subscribe(
  //     response => this.response = response,
  //     error => console.error(error),
  //     () => {
  //       if (this.response.success) {
  //         this.snackBar.open(`Usuario registrado correctamente`, 'OK')
  //       } else {
  //         this.snackBar.open(`Error: ${this.response.errorMessage}`, 'OK')
  //       }
  //     }
  //   )
  // }

  registerMany(users?: User[]) {
    this.auth.registerMany(this.users).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => {
        if (this.response.success) {
          this.snackBar.open(`Usuarios registrados: ${this.response.registeredUsers}`, 'OK')
        } else {
          this.snackBar.open(`Error: ${this.response.errorMessage}`, 'REVISAR FICHERO')
        }
      }
    )
  }

  /**
   * Set the users attribute to bulk register all of these users.
   * @param event JSON file upload
   */
  onFileSelected(event) {
    // this.appService.onFileSelected(event)

    this.selectedFile = event.target.files[0]
    const fileReader = new FileReader()
    fileReader.readAsText(this.selectedFile, 'UTF-8')
    fileReader.onloadend = () => this.users = JSON.parse(fileReader.result as string)
    fileReader.onerror = error => console.error(error)
  }

}
