import { Component, Input } from '@angular/core'
import { MatSlideToggleChange } from '@angular/material'

import { Doc } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'


@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.css']
})
export class DocComponent {

  @Input() doc: Doc

  constructor(
    private appService: AppService,
    private auth: AuthenticationService
  ) { }

  /**
   * Toggle completed status of a doc (completed/uncompleted).
   */
  onChange(event: MatSlideToggleChange): void {
    // Visualy toggle the completed property (boolean)
    this.doc.completed = event.checked

    // Make that change permanent into database
    const docToMark = {
      // userId: this.auth.user.id,
      userId: this.auth.getCurrentUser().id,
      docId: this.doc.id
    }
    if (this.doc.completed) {
      this.appService.addCompletedDoc(docToMark).subscribe()
    } else {
      this.appService.removeCompletedDoc(docToMark).subscribe()
    }
  }

}
