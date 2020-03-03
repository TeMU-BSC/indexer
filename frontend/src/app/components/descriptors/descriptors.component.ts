import { ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnChanges, Output, EventEmitter } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'

import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { Annotation } from 'src/app/models/api'
import { Doc, Descriptor } from 'src/app/models/decs'
import { FormConfig } from 'src/app/models/form'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { customSort, inputIncludedInValue, removeConsecutiveSpaces } from 'src/app/utilities/functions'

@Component({
  selector: 'app-descriptors',
  templateUrl: './descriptors.component.html',
  styleUrls: ['./descriptors.component.scss']
})
export class DescriptorsComponent implements OnChanges {

  @Input() doc: Doc
  @Input() formConfig: FormConfig
  @Input() removable: boolean
  @Input() validation: boolean
  @Output() decsChange = new EventEmitter<boolean>()
  @ViewChild('chipInput') chipInput: ElementRef<HTMLInputElement>
  @ViewChild('auto') matAutocomplete: MatAutocomplete
  autocompleteChipList = new FormControl()
  addOnBlur = true
  separatorKeysCodes: number[] = [ENTER]
  options: Descriptor[]
  precodedDescriptors: Descriptor[]
  filteredOptions: Observable<Descriptor[]>
  chips = []
  annotation: Annotation

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // init the options
    this.options = this.api.allDescriptors
    // init the precoded descriptors
    this.precodedDescriptors = this.api.getPrecodedDescriptors()
    // filter descriptors as the user types in the input field
    this.filteredOptions = this.autocompleteChipList.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((value: string | null) => value
        ? this.customFilter(value, 'termSpanish', ['termSpanish', 'termEnglish', 'meshCode', 'synonyms'])
        : this.precodedDescriptors.filter(d => !this.chips.includes(d)))
    )
  }

  /**
   * This component implements OnChanges method so it can react to parent changes on its @Input() 'doc' property.
   */
  ngOnChanges() {
    // get the current annotations from the user
    this.chips = this.options.filter(descriptor => this.doc.decsCodes.includes(descriptor.decsCode))
    // if initial view (not validation phase), exit
    if (!this.validation) { return }
    // if doc is validated, get the finished validated annotations and exit
    if (this.doc.validated) {
      this.api.getValidatedDecsCodes({ user: this.auth.getCurrentUser().id, doc: this.doc.id }).subscribe(
        response => this.chips = this.options.filter(descriptor => response.validatedDecsCodes.includes(descriptor.decsCode))
      )
      return
    }
    // otherwise it's validation mode, add suggestions to chips list
    this.api.getSuggestions({ doc: this.doc.id, user: this.auth.getCurrentUser().id }).subscribe(
      response => {
        // get suggestions from other users
        const suggestions = this.options.filter(descriptor => response.suggestions.includes(descriptor.decsCode))
        // set icon for chips previously added by the current user
        this.chips.forEach(chip => {
          chip.iconColor = 'accent'
          chip.iconName = 'person'
        })
        // remove possible duplicated chips
        this.chips = this.chips.filter(chip => !suggestions.includes(chip))
        // merge the two lists
        this.chips = this.chips.concat(suggestions)
      }
    )
  }

  /**
   * Custom filter for the descriptors.
   */
  customFilter(input: string, sortingKey: string, filterKeys: string[]): Descriptor[] {
    // ignore the starting and ending whitespaces; replace double/multiple whitespaces by single whitespace
    input = removeConsecutiveSpaces(input)
    // if numeric, find the exact decsCode match (there are no decsCodes with 1 digit)
    if (input.length >= 2 && !isNaN(Number(input))) {
      const decsFiltered = this.api.allDescriptors
        .filter(descriptor => descriptor.decsCode.startsWith(input) && !this.chips.includes(descriptor))
      return customSort(decsFiltered, input, 'decsCode')
    }
    // avoid showing the descriptors that are already added to current doc
    const alreadyAdded = (descriptor: Descriptor) => this.chips.some(chip => chip.decsCode === descriptor.decsCode)
    const remainingDescriptors = this.api.allDescriptors.filter(descriptor => !alreadyAdded(descriptor))
    // filter the available descriptors by the given keys checking if input is included in value
    const filtered = remainingDescriptors.filter(descriptor => filterKeys.some(key => inputIncludedInValue(input, descriptor, key)))
    // return the sorted results by custom criteria
    return customSort(filtered, input, sortingKey)
  }

  /**
   * Add a chip to chip list and send it to the backend to add it to database.
   */
  addChip(event: MatAutocompleteSelectedEvent): void {
    // get the selected chip from the event
    const selectedDescriptor: Descriptor = event.option.value
    const chip: any = selectedDescriptor
    // if validation mode, add the icon
    if (this.validation) {
      chip.iconColor = 'warn'
      chip.iconName = 'person'
    }
    // add the chip to the chips list
    this.chips.push(chip)
    // add the code to the doc associated decsCodes list
    this.doc.decsCodes.push(chip.decsCode)
    // clear the typed text from the input field
    this.chipInput.nativeElement.value = ''
    this.autocompleteChipList.setValue('')
    // optionally send new annotation to backend
    if (!this.validation) {
      this.annotation = {
        decsCode: chip.decsCode,
        user: this.auth.getCurrentUser().id,
        doc: this.doc.id,
      }
      this.api.addAnnotation(this.annotation).subscribe(() => this.decsChange.emit(true))
    }
  }

  /**
   * Remove a chip from the chip list and send it to the backend to remove it from database.
   */
  removeChip(chip: Descriptor): void {
    // remove chip from input field
    const index = this.chips.indexOf(chip)
    if (index >= 0) {
      this.chips.splice(index, 1)
    }
    // remove the code from the doc associated decsCodes list
    const indexCode = this.doc.decsCodes.indexOf(chip.decsCode)
    this.doc.decsCodes.splice(indexCode, 1)
    // build annotation object to send to backend
    this.annotation = {
      decsCode: chip.decsCode,
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id,
    }
    // optionally, remove annotation from backend
    if (!this.validation) { this.api.removeAnnotation(this.annotation).subscribe(() => this.decsChange.emit(true)) }
    // give visual feedback to the user
    const snackBarRef = this.snackBar.open(`DeCS borrado: ${chip.termSpanish} (${chip.decsCode})`, 'DESHACER')
    // if the action button is clicked, re-add the recently removed chip (and optionally annotation to backend)
    snackBarRef.onAction().subscribe(() => {
      this.chips.push(chip)
      if (!this.validation) { this.api.addAnnotation(this.annotation).subscribe(() => this.decsChange.emit(true)) }
    })
  }

  /**
   * Open a confirmation dialog before performing an action to a given array and optionally apply changes to backend.
   */
  confirmDialogBeforeRemove(chip: Descriptor): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: `${chip.termSpanish} (${chip.decsCode})`,
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
