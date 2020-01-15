import { Component, Input } from '@angular/core'
import { MatSlideToggleChange } from '@angular/material'

import { Doc } from 'src/app/app.model'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'


@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.css']
})
export class DocComponent {

  @Input() doc: Doc

  constructor(
    public api: ApiService,
    private auth: AuthService
  ) { }

  /**
   * Toggle completed status of a doc (completed/pending).
   */
  onChange(event: MatSlideToggleChange): void {
    // Visualy toggle the completed property (boolean)
    this.doc.completed = event.checked

    // Make that change permanent into database
    const docToMark = {
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id,
      mode: this.api.revisionMode ? 'revision' : 'assignment'
    }
    this.doc.completed ? this.api.addCompletedDoc(docToMark).subscribe() : this.api.removeCompletedDoc(docToMark).subscribe()
  }

}
