import { Component, Input } from '@angular/core'
import { Doc } from 'src/app/app.model'
import { MatSlideToggleChange, MatSnackBar } from '@angular/material'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.css']
})
export class DocComponent {

  @Input() doc: Doc
  // toggleText: string

  constructor(
    private appService: AppService,
    private auth: AuthenticationService,
    // private snackBar: MatSnackBar
  ) { }

  /**
   * If doc is uncompleted, mark as completed; and the other way around.
   */
  // onChange(event: MatSlideToggleChange): void {
  //   if (!this.doc.decsCodes.length) {
  //     // Warn the user that DeCS list is empty
  //     this.snackBar.open('Atención: El artículo debe tener al menos un DeCS para marcarlo como completado.', 'OK')
  //     // and change back the toggle slide
  //     // console.log(this.doc.completed)
  //     // this.doc.completed = false
  //   } else {
  //     // Visualy toggle the completed property (true / false)
  //     this.doc.completed = event.checked
  //     // Make that change permanent to database
  //     const docToMark = {
  //       userId: this.auth.getUserDetails().identity.id,
  //       docId: this.doc.id
  //     }
  //     if (this.doc.completed) {
  //       this.appService.addCompletedDoc(docToMark).subscribe()
  //     } else {
  //       this.appService.removeCompletedDoc(docToMark).subscribe()
  //     }
  //   }
  // }

  /**
   * If doc is uncompleted, mark as completed; and the other way around.
   */
  onChange(event: MatSlideToggleChange): void {
    // Visualy toggle the completed property (true / false)
    this.doc.completed = event.checked

    // Make that change permanent to database
    const docToMark = {
      userId: this.auth.getUserDetails().identity.id,
      docId: this.doc.id
    }
    if (this.doc.completed) {
      // this.toggleText = 'Completado'
      this.appService.addCompletedDoc(docToMark).subscribe()
    } else {
      // this.toggleText = 'Marcar como completado'
      this.appService.removeCompletedDoc(docToMark).subscribe()
    }
  }

}
