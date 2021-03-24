import { Component } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import * as EXAMPLE_USER from 'src/assets/examples/user.json'
import * as EXAMPLE_DOCUMENT from 'src/assets/examples/document.json'
import * as EXAMPLE_DOCUMENT_DELETE from 'src/assets/examples/delete-documents.json'
import * as EXAMPLE_ASSIGNMENT from 'src/assets/examples/assignment.json'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { ApiResponse, Document, Term, User } from 'src/app/models/interfaces'

export interface Action {
  name: string
  method: any
  jsonSnippet: string
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  dataFromFile: User[] | Term[] | Document[]
  selectedFile: File
  response: ApiResponse
  projects: any[] = [
    { name: 'mesinesp2', db: 'mesinesp2' },
  ]
  actions: Action[] = [
    { name: 'Añadir documentos', method: this.insertDocs.bind(this), jsonSnippet: (EXAMPLE_DOCUMENT as any).default },
    { name: 'Eliminar documentos', method: this.deleteDocs.bind(this), jsonSnippet: (EXAMPLE_DOCUMENT_DELETE as any).default },
    // { name: 'registrar usuarios', method: this.registerUsers.bind(this), jsonSnippet: (EXAMPLE_USER as any).default },
    // { name: 'asignar documentos a usuarios', method: this.assignDocsToUsers.bind(this), jsonSnippet: (EXAMPLE_ASSIGNMENT as any).default },
  ]
  selectedProject: any
  selectedAction: Action

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

  registerUsers() {
    this.auth.registerUsers(this.dataFromFile as User[]).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => {
        if (this.response.success) {
          this.snackBar.open(`Usuarios registrados: ${this.response.success}`, 'OK')
        } else {
          this.snackBar.open(`Error: ${this.response.message}`, 'REVISAR FICHERO')
        }
      }
    )
  }

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

  insertDocs() {
    this.api.addDocuments(this.dataFromFile as Document[]).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => {
        if (this.response.success) {
          this.snackBar.open(`Documentos añadidos correctamente.`, 'Vale')
        } else {
          this.snackBar.open(`Error: ${this.response.message}. Por favor, revisa el formato JSON del fichero.`, 'Vale')
        }
      }
    )
  }


  deleteDocs() {
    this.api.deleteDocuments(this.dataFromFile as Document[]).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => {
        if (this.response.success) {
          this.snackBar.open(`Documentos eliminados correctamente.`, 'Vale')
        } else {
          this.snackBar.open(`Error: ${this.response.message}. Por favor, revisa el formato JSON del fichero.`, 'Vale')
        }
      }
    )
  }


}
