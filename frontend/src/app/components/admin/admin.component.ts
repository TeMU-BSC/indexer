import { Component } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ApiResponse } from 'src/app/models/api'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import * as EXAMPLE_ASSIGNMENT from 'src/assets/examples/assignment.json'
import * as EXAMPLE_DESCRIPTOR from 'src/assets/examples/descriptor.json'
import * as EXAMPLE_USER from 'src/assets/examples/user.json'


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
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
      exampleJson: (EXAMPLE_ASSIGNMENT as any).default,
      action: 'assignDocsToUsers()'
    },
    // {
    //   title: 'Cargar DeCS indizados [#to_do]',
    //   keywords: 'DeCS indizados',
    //   exampleJson: (EXAMPLE_DESCRIPTOR as any).default,
    //   action: 'functionToBeImplemented()'
    // },
    // {
    //   title: 'Cargar sugerencias DeCS [#to_do]',
    //   keywords: 'DeCS sugeridos',
    //   exampleJson: (EXAMPLE_DESCRIPTOR as any).default,
    //   action: 'functionToBeImplemented()'
    // }
  ]

  constructor(
    public api: ApiService,
    public auth: AuthService,
    private snackBar: MatSnackBar
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

        break
      case 'Cargar sugerencias DeCS':

        break
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
          this.snackBar.open(`Error: ${this.response.message}`, 'REVISAR FICHERO')
        }
      }
    )
  }

  assignDocsToUsers() {
    this.api.assignDocsToUsers(this.dataFromFile).subscribe(
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
