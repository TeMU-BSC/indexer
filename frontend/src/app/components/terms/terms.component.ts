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
    this.options = this.api.terms

    // Filter terms as the user types in the input field.
    this.filteredOptions = this.autocompleteChipList.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((value: string | null) => this.customFilter(value, 'term', ['term']))
    )
  }

  /**
   * This component implements OnChanges method so it can react to parent changes on its @Input() 'doc' property.
   */
  ngOnChanges() {

    // if initial view (not validation phase), exit
    if (!this.validation) { return }
    // if doc is validated, get the finished validated indexings and exit
    if (this.doc.validated) {
      this.api.getValidatedDecsCodes({
        document_identifier: this.doc.identifier,
        user_email: this.auth.getCurrentUser().email,
      })
        .subscribe(
          response => this.doc.terms = this.options.filter(term => response.validatedTermCodes.includes(term.code))
        )
      return
    }
    // otherwise it's validation mode, add suggestions to chips list
    this.api.getSuggestions({
      document_identifier: this.doc.identifier,
      user_email: this.auth.getCurrentUser().email,
    })
      .subscribe(
        response => {
          // get suggestions from other users
          const suggestions = this.options.filter(term => response.suggestions.includes(term.code))
          // set icon for chips previously added by the current user
          // this.doc.terms.forEach(chip => {
          //   chip.iconColor = 'accent'
          //   chip.iconName = 'person'
          // })
          // remove possible duplicated chips
          this.doc.terms = this.doc.terms.filter(chip => !suggestions.includes(chip))
          // merge the two lists
          this.doc.terms = this.doc.terms.concat(suggestions)
        }
      )
  }

  /**
   * Custom filter for the terms.
   */
  customFilter(input: string, sortingKey: string, filterKeys: string[]): Term[] {
    // ignore the starting and ending whitespaces; replace double/multiple whitespaces by single whitespace
    input = removeConsecutiveSpaces(input)
    // if numeric, find the exact code match (there are no terms with 1 digit)
    if (input.length >= 2 && !isNaN(Number(input))) {
      const decsFiltered = this.api.terms
        .filter(term => term.code.startsWith(input) && !this.doc.terms.includes(term))
      return customSort(decsFiltered, input, 'code')
    }
    // avoid showing the terms that are already added to current doc
    const alreadyAdded = (term: Term) => this.doc.terms.some(chip => chip.code === term.code)
    const remainingTerms = this.api.terms.filter(term => !alreadyAdded(term))
    // filter the available terms by the given keys checking if input is included in value
    const filtered = remainingTerms.filter(term => filterKeys.some(key => inputIncludedInValue(input, term, key)))
    // return the sorted results by custom criteria
    return customSort(filtered, input, sortingKey)
  }

  /**
   * Add a chip to chip list and send it to the backend to add it to database.
   */
  addChip(event: MatAutocompleteSelectedEvent): void {
    const chip = event.option.value as Term
    this.doc.terms.push(chip)
    this.chipInput.nativeElement.value = ''
    this.autocompleteChipList.setValue('')
    const indexing = {
      document_identifier: this.doc.identifier,
      user_email: this.auth.getCurrentUser().email,
      term: chip,
    }
    this.api.addTermToDoc(indexing).subscribe()
  }

  /**
   * Remove a chip from the chip list and send it to the backend to remove it from database.
   */
  removeChip(chip: Term): void {

    // Remove the chip from visual list.
    const index = this.doc.terms.indexOf(chip)
    if (index >= 0) {
      this.doc.terms.splice(index, 1)
    }

    // Emulate term removal for the user.
    const snackBarRef = this.snackBar.open('Término borrado del documento.', 'Deshacer')

    // If the action button of snackbar is clicked, the term is not removed.
    snackBarRef.onAction().subscribe(() => {
      this.doc.terms.splice(index, 0, chip)
      this.snackBar.open('El término no ha sido borrado.', 'Vale', { duration: 5000 })
    })

    // Otherwise, if the the the snackbar is closed by timeout, the term is sent to the backend to be deleted.
    snackBarRef.afterDismissed().subscribe(info => {
      if (!info.dismissedByAction) {

        // // Remove the term from the terms list associated with the doc.
        // const index = this.doc.terms.indexOf(chip)
        // this.doc.terms.splice(index, 1)

        // Remove the indexing from database.
        const indexing = {
          document_identifier: this.doc.identifier,
          user_email: this.auth.getCurrentUser().email,
          term: chip,
        }
        this.api.removeIndexing(indexing).subscribe()
      }
    })
  }

  /**
   * Open a confirmation dialog before performing an action to a given array and optionally apply changes to backend.
   */
  confirmDialogBeforeRemove(chip: Term): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: `${chip.term} (${chip.code})`,
        content: '¿Quieres borrar esta anotación?',
        cancel: 'Cancelar',
        buttonName: 'Borrar',
        color: 'warn'
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.removeChip(chip)
      }
    })
  }

}
