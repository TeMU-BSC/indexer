import { ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'

import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { Doc, Descriptor } from 'src/app/models/decs'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { removeAccents, customSort } from 'src/app/utilities/functions'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { Annotation } from 'src/app/models/api'
import { FormConfig } from 'src/app/models/form'


@Component({
  selector: 'app-descriptors',
  templateUrl: './descriptors.component.html',
  styleUrls: ['./descriptors.component.scss']
})
export class DescriptorsComponent implements OnChanges {

  @Input() doc: Doc
  @Input() validation: boolean
  @Input() formConfig: FormConfig
  @ViewChild('chipInput') chipInput: ElementRef<HTMLInputElement>
  @ViewChild('auto') matAutocomplete: MatAutocomplete
  // Set up reactive formControl
  autocompleteChipList = new FormControl()
  // Set up values to use with chips
  addOnBlur = true
  @Input() removable: boolean
  selectable = true
  separatorKeysCodes: number[] = [ENTER]
  // Set up options array
  options: Descriptor[]
  precodedDescriptors: Descriptor[]
  // Define filteredOptins Array and Chips Array
  filteredOptions: Observable<Descriptor[]>
  chips = []

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Init the options
    this.options = this.api.allDescriptors
    // Init the precoded descriptors
    this.precodedDescriptors = this.api.getPrecodedDescriptors()
    // Filter descriptors as the user types in the input field
    this.filteredOptions = this.autocompleteChipList.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((value: string | null) => value
        ? this.customFilter(value, 'termSpanish')
        : this.precodedDescriptors.filter(d => !this.chips.includes(d)))
    )
  }

  /**
   * This component implements OnChanges method so it can react to parent changes on its @Input() 'doc' property.
   */
  ngOnChanges() {
    // get the current annotations from the user
    this.chips = this.options.filter(descriptor => this.doc.decsCodes.includes(descriptor.decsCode))
    // if normal mode, don't check anything more
    if (!this.validation) {
      return
    }
    // validation annotation view
    if (this.doc.validated) {
      // get the finished validated annotations
      this.api.getValidatedDecsCodes({ user: this.auth.getCurrentUser().id, doc: this.doc.id }).subscribe(
        response => this.chips = this.options.filter(descriptor => response.validatedDecsCodes.includes(descriptor.decsCode))
      )
      return
    }
    // get suggestions and add them to chips list
    this.api.getSuggestions({ doc: this.doc.id, user: this.auth.getCurrentUser().id }).subscribe(
      response => {
        // get suggestions from backend
        const suggestions: any = this.options.filter(descriptor => response.suggestions.includes(descriptor.decsCode))
        console.log(this.chips)
        console.log(suggestions)
        // set icon for previuos own chips
        this.chips.forEach(chip => {
          chip.iconColor = 'warn'
          chip.iconName = 'person'
        })
        // set icon for suggestion chips
        suggestions.forEach(chip => {
          chip.iconColor = 'primary'
          chip.iconName = 'people'
        })
        // merge the two lists
        this.chips = this.chips.concat(suggestions)
        console.log(this.chips)
      }
    )
  }

  /**
   * Custom filter for the descriptors.
   */
  customFilter(input: string, sortingKey: string): Descriptor[] {
    // Ignore the starting and ending whitespaces. Replace double/multiple whitespaces by single whitespace.
    input = input.trim().replace(/ +(?= )/g, '')
    // If numeric, find the exact decsCode match (there are no decsCodes with 1 digit)
    if (input.length >= 2 && !isNaN(Number(input))) {
      const decsFiltered = this.api.allDescriptors
        .filter(descriptor => descriptor.decsCode.startsWith(input) && !this.chips.includes(descriptor))
      return customSort(decsFiltered, input, 'decsCode')
    }
    // Normalize the lower-cased input
    input = removeAccents(input.toLowerCase())
    // Avoid showing the descriptors that are already added to current doc
    const alreadyAdded = (descriptor: Descriptor) => this.chips.some(chip => chip.decsCode === descriptor.decsCode)
    const subsetToFilter = this.api.allDescriptors.filter(descriptor => !alreadyAdded(descriptor))
    // Filter the descriptors by some HARDCODED properties (#TODO refactor)
    const filtered = subsetToFilter.filter(descriptor =>
      removeAccents(descriptor.termSpanish.toLowerCase()).includes(input)
      || removeAccents(descriptor.termEnglish.toLowerCase()).includes(input)
      || removeAccents(descriptor.meshCode.toLowerCase()).includes(input)
      || removeAccents(descriptor.synonyms.toLowerCase()).includes(input)
    )
    // Return the sorted results by matching importance
    return customSort(filtered, input, sortingKey)
  }

  /**
   * Add a chip to chip list and send it to the backend to add it to database.
   */
  addChip(event: MatAutocompleteSelectedEvent, backend: boolean): void {
    // Get the selected chip from the event
    const selectedDescriptor: Descriptor = event.option.value
    // Add the chip to the chips list
    this.chips.push(selectedDescriptor)
    // Clear the typed text from the input field
    this.chipInput.nativeElement.value = ''
    this.autocompleteChipList.setValue('')
    // Optionally, send new annotation to backend
    if (backend) {
      this.api.addAnnotation({
        decsCode: selectedDescriptor.decsCode,
        user: this.auth.getCurrentUser().id,
        doc: this.doc.id,
      }).subscribe()
    }
  }

  /**
   * Remove a chip from the chip list and send it to the backend to remove it from database.
   */
  removeChip(chip: Descriptor, backend: boolean): void {
    // Remove chip from input field
    const index = this.chips.indexOf(chip)
    if (index >= 0) {
      this.chips.splice(index, 1)
    }
    // Optionally, remove annotation from backend
    const annotation: Annotation = {
      decsCode: chip.decsCode,
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id,
    }
    if (backend) {
      this.api.removeAnnotation(annotation).subscribe()
      // Visual information to the user
      const snackBarRef = this.snackBar.open(`DeCS borrado: ${chip.termSpanish} (${chip.decsCode})`, 'DESHACER')
      // If the action button is clicked, re-add the recently removed annotation
      snackBarRef.onAction().subscribe(() => {
        this.chips.push(chip)
        this.api.addAnnotation(annotation).subscribe()
      })
    }
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
        // avoid removing from backend when validation mode is true
        const backend = !this.validation
        this.removeChip(chip, backend)
      }
    })
  }

}
