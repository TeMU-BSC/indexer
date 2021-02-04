import { Component } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import * as EXAMPLE_USER from 'src/assets/examples/user.json'
import * as EXAMPLE_DOCUMENT from 'src/assets/examples/document.json'
import * as EXAMPLE_ASSIGNMENT from 'src/assets/examples/assignment.json'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { ApiResponse, User } from 'src/app/models/interfaces'


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  dataFromFile: any[]
  selectedFile: File
  response: ApiResponse
  projects = [
    { name: 'mesinesp', db: 'BvSalud' },
    { name: 'desarrollo', db: 'dev' },
  ]
  actions = [
    // { name: 'registrar usuario', method: this.registerUser.bind(this), jsonSnippet: (EXAMPLE_USER as any).default },
    // { name: 'insertar documento', method: this.insertDocs.bind(this), jsonSnippet: (EXAMPLE_DOCUMENT as any).default },
    // { name: 'asignar documentos a usuarios', method: this.assignDocsToUsers.bind(this), jsonSnippet: (EXAMPLE_ASSIGNMENT as any).default },
  ]

  constructor(
    public api: ApiService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) { }

  /**
   * Set the content of the uploaded file to the 'dataFromFile' property.
   * @param event JSON file upload
   */
  onFileSelected(event) {
    this.selectedFile = event.target.files[0]
    const fileReader = new FileReader()
    fileReader.readAsText(this.selectedFile, 'UTF-8')
    fileReader.onloadend = () => this.dataFromFile = JSON.parse(fileReader.result as string)
    fileReader.onerror = error => console.error(error)
  }

  // registerUser() {
  //   this.auth.registerUser(this.dataFromFile).subscribe(
  //     response => this.response = response,
  //     error => console.error(error),
  //     () => {
  //       if (this.response.success) {
  //         this.snackBar.open(`Usuario registrado: ${this.response.success}`, 'OK')
  //       } else {
  //         this.snackBar.open(`Error: ${this.response.message}`, 'REVISAR FICHERO')
  //       }
  //     }
  //   )
  // }

  // assignDocsToUsers() {
  //   this.api.assignDocsToUsers(this.dataFromFile).subscribe(
  //     response => this.response = response,
  //     error => console.error(error),
  //     () => {
  //       if (this.response.success) {
  //         this.snackBar.open(`Documentos asignados a usuarios correctamente.`, 'OK')
  //       } else {
  //         this.snackBar.open(`Error al asignar documentos a usuarios.`, 'REVISAR FICHERO')
  //       }
  //     }
  //   )
  // }

  // insertDocs() {
  //   alert('TODO: Implement create docs in backend')
  // }

}
