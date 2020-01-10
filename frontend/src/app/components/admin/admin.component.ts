import { Component } from '@angular/core'
import { ApiResponse } from 'src/app/app.model'
import { AuthenticationService } from 'src/app/services/auth.service'
import { MatSnackBar } from '@angular/material'

import { AppService } from 'src/app/services/app.service'
import * as EXAMPLE_USER from 'src/assets/examples/user.json'
import * as EXAMPLE_DOCUMENT from 'src/assets/examples/document.json'
import * as EXAMPLE_DESCRIPTOR from 'src/assets/examples/descriptor.json'


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  dataFromFile: any[]
  selectedFile: File
  response: ApiResponse
  panels = [
    {
      title: 'Registrar usuarios',
      keywords: 'usuarios',
      exampleJson: (EXAMPLE_USER as any).default,
      action: 'registerManyUsers()'
    },
    {
      title: 'Asignar documentos a usuarios',
      keywords: 'asignaciones de documentos',
      exampleJson: (EXAMPLE_DOCUMENT as any).default,
      action: 'assignDocsToUsers()'
    },
    {
      title: 'Cargar DeCS indizados [#to_do]',
      keywords: 'DeCS indizados',
      exampleJson: (EXAMPLE_DESCRIPTOR as any).default,
      action: 'functionToBeImplemented()'
    },
    {
      title: 'Cargar sugerencias DeCS [#to_do]',
      keywords: 'DeCS sugeridos',
      exampleJson: (EXAMPLE_DESCRIPTOR as any).default,
      action: 'functionToBeImplemented()'
    }
  ]

  constructor(
    public auth: AuthenticationService,
    private snackBar: MatSnackBar,
    public appService: AppService
  ) { }

  /**
   * Set the content of the uploaded file to the 'data' property.
   * @param event JSON file upload
   */
  onFileSelected(event) {
    this.selectedFile = event.target.files[0]
    const fileReader = new FileReader()
    fileReader.readAsText(this.selectedFile, 'UTF-8')
    fileReader.onloadend = () => this.dataFromFile = JSON.parse(fileReader.result as string)
    fileReader.onerror = error => console.error(error)
  }

  onClickEvent(panel: any) {
    switch (panel.title) {
      case 'Registrar usuarios':
        this.registerManyUsers()
        break
      case 'Asignar documentos a usuarios':
        this.assignDocsToUsers()
        break
      case 'Cargar DeCS indizados':
        // console.log('panel 3')
        break
      case 'Cargar sugerencias DeCS':
        // console.log('panel 4')
        break
      default:
      // console.log('Unexpected panel')
    }
  }

  registerManyUsers() {
    this.auth.registerMany(this.dataFromFile).subscribe(
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

  assignDocsToUsers() {
    this.appService.assignDocs(this.dataFromFile).subscribe(
      response => this.response = response,
      error => console.error(error),
      () => {
        if (this.response.success) {
          this.snackBar.open(`Documentos asignados a usuarios correctamente.`, 'OK')
        } else {
          this.snackBar.open(`Error al asignar documentos a usuarios.`, 'REVISAR FICHERO')
        }
      }
    )
  }

}
