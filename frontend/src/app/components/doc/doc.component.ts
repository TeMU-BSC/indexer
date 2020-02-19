import { Component, Input, ViewChild, AfterViewInit } from '@angular/core'
import { MatSlideToggleChange } from '@angular/material/slide-toggle'

import { Doc } from 'src/app/models/decs'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { SuggestionsComponent } from 'src/app/components/suggestions/suggestions.component'


@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss']
})
export class DocComponent implements AfterViewInit {

  @Input() doc: Doc
  @ViewChild(SuggestionsComponent) suggestions: SuggestionsComponent

  constructor(
    public api: ApiService,
    private auth: AuthService
  ) { }

  ngAfterViewInit() { }

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
      this.api.markAsCompleted(docToMark).subscribe(
        () => this.api.getSuggestions(docToMark).subscribe(next => this.doc.suggestions = next.suggestions)
      )
    } else {
      this.api.markAsUncompleted(docToMark).subscribe()
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
    // this.doc.validated ? this.api.addValidation(docToMark).subscribe() : this.api.removeValidation(docToMark).subscribe()
    if (this.doc.validated) {
      this.api.markAsValidated(docToMark).subscribe()
      this.suggestions.chips.forEach(chip => {
        // Build the object to sent to backend
        const annotationToAdd = {
          decsCode: chip.decsCode,
          user: this.auth.getCurrentUser().id,
          doc: this.doc.id
        }
        // Add the clicked chip descriptor to database
        // this.api.addValidation(annotationToAdd).subscribe()
      })
    } else {
      this.api.markAsUnvalidated(docToMark).subscribe()
      // REMOVE ANNOTATIONS FROM VALIDATIONS COLLECTION
    }
  }

  testChild() {
    console.log('myDoc:', this.doc)
    console.log('myChild:', this.suggestions)
  }

}
