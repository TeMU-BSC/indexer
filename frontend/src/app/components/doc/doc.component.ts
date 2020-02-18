import { Component, Input } from '@angular/core'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'

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
   * Toggle completed status of a doc.
   */
  toggleCompleted(event: MatSlideToggleChange): void {
    // Visualy toggle the completed property (boolean)
    this.doc.completed = event.checked
    // Make that change permanent into database
    const docToMark = {
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id
    }
    if (this.doc.completed) {
      this.api.addCompletion(docToMark).subscribe(
        () => this.api.getSuggestions(docToMark).subscribe(next => this.doc.suggestions = next.decsCodesFromOthers)
      )
    } else {
      this.api.removeCompletion(docToMark).subscribe()
    }
  }

  /**
   * Toggle validated status of a doc.
   */
  toggleValidated(event: MatSlideToggleChange): void {
    // Visualy toggle the completed property (boolean)
    this.doc.validated = event.checked
    // Make that change permanent into database
    const docToMark = {
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id
    }
    this.doc.validated ? this.api.addValidation(docToMark).subscribe() : this.api.removeValidation(docToMark).subscribe()
  }

}
