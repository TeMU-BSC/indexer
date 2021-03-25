import { ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Observable } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { Document, Indexing, Term } from 'src/app/models/interfaces'
import { FormConfig } from 'src/app/models/interfaces'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { customSort, inputIncludedInValue, removeConsecutiveSpaces } from 'src/app/helpers/functions'

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnChanges {

  @Input() doc: Document
  @Input() formConfig: FormConfig
  @Input() removable: boolean
  @Input() validation: boolean
  @Output() termChange = new EventEmitter<boolean>()
  @ViewChild('chipInput') chipInput: ElementRef<HTMLInputElement>
  @ViewChild('auto') matAutocomplete: MatAutocomplete
  autocompleteChipList = new FormControl()
  separatorKeysCodes: number[] = [ENTER]
  options: Term[]
  filteredOptions: Observable<Term[]>

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.filteredOptions = this.filterTermsAsUserTypes()
  }

  /**
   * This component implements OnChanges method so it can react to parent changes on its '@Input() doc' property.
   */
  ngOnChanges() {
    const validatedIndexings: any = {
      document_identifier: this.doc.identifier,
      user_email: this.auth.getCurrentUser().email,

    }

    // If initial view (not validation phase), early exit.
    if (!this.validation) { return }

    // If doc is validated, get the finished validated indexings, early exit.
    if (this.doc.validated) {
      this.api.getValidatedDecsCodes(validatedIndexings).subscribe(response =>
        this.doc.terms = this.options.filter(term => response.validatedTermCodes.includes(term.code))
      )
      return
    }

    // Otherwise it's validation mode, add suggestions to chips list.
    this.api.getSuggestions(validatedIndexings).subscribe(response => {

      // Get suggestions from other users.
      const suggestions = this.options.filter(term => response.suggestions.includes(term.code))

      // Remove possible duplicated chips.
      this.doc.terms = this.doc.terms.filter(term => !suggestions.includes(term))

      // Merge the two previous lists.
      this.doc.terms = this.doc.terms.concat(suggestions)
    }
    )
  }

  filterTermsAsUserTypes() {
    return this.autocompleteChipList.valueChanges.pipe(
      debounceTime(1000),
      startWith(''),
      map((value: string | null) => this.customFilter(value, 'name', ['name']))
    )
  }

  /**
   * Filter all the available terms by pre-cleaned input search criteria.
   * Avoid showing the terms that have been already added to the document.
   * Return the filtered terms by a custom sorting.
   */
  customFilter(inputText: string, sortingKey: string, filterKeys: string[]): Term[] {
    let searchCriteria
    let isNumeric
    let remainingTerms;
    let filteredTerms;
    this.api.getTerms().subscribe(
      response => this.options = response,
      error => console.error(error),
      () => {
        searchCriteria = removeConsecutiveSpaces(inputText)
        isNumeric = !isNaN(Number(searchCriteria))
        const atLeastTwoDigits = isNumeric && searchCriteria.length >= 2
        if (atLeastTwoDigits) {
          const filteredTerms = this.options.filter(term => term.code.startsWith(searchCriteria) && !this.doc.terms.includes(term))
          return customSort(filteredTerms, searchCriteria, 'code')
        }
        const alreadyAddedToDocument = (term: Term) => this.doc.terms.some(chip => chip.code === term.code)
        remainingTerms = this.options.filter(term => !alreadyAddedToDocument(term))
        filteredTerms = remainingTerms.filter(term => filterKeys.some(key => inputIncludedInValue(searchCriteria, term, key)))
        console.log(filteredTerms);
      });
      
    return customSort(filteredTerms, searchCriteria, sortingKey)
  }

  addTerm(event: MatAutocompleteSelectedEvent): void {
    const term = event.option.value as Term
    this.doc.terms.push(term)
    this.chipInput.nativeElement.value = ''
    this.autocompleteChipList.setValue('')
    const indexing: Indexing = {
      document_identifier: this.doc.identifier,
      user_email: this.auth.getCurrentUser().email,
      term: term,
    }
    this.api.addTermToDoc(indexing).subscribe()
  }

  removeTerm(term: Term): void {

    // Remove the chip visually.
    const index = this.doc.terms.indexOf(term)
    if (index >= 0) {
      this.doc.terms.splice(index, 1)
    }

    // Emulate term removal.
    const snackBarRef = this.snackBar.open('Término borrado del documento.', 'Deshacer')

    // If the action button of snackbar is clicked, the term is not removed.
    snackBarRef.onAction().subscribe(() => {
      this.doc.terms.splice(index, 0, term)
      this.snackBar.open('El término no ha sido borrado.', 'Vale', { duration: 5000 })
    })

    // Otherwise, if the the the snackbar is closed by timeout, the term is sent to the backend to be deleted.
    snackBarRef.afterDismissed().subscribe(info => {
      if (!info.dismissedByAction) {

        // Remove the indexing from database.
        const indexing: Indexing = {
          document_identifier: this.doc.identifier,
          user_email: this.auth.getCurrentUser().email,
          term: term,
        }
        this.api.removeTermFromDoc(indexing).subscribe()
      }
    })
  }

  /**
   * Open a confirmation dialog before removing a term drom the document.
   */
  confirmDialogBeforeRemove(term: Term): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: `${term.name} (${term.code})`,
        content: '¿Quieres borrar esta anotación?',
        cancel: 'Cancelar',
        buttonName: 'Borrar',
        color: 'warn'
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.removeTerm(term)
      }
    })
  }

}
