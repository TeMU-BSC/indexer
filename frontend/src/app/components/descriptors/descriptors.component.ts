import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnInit, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'

import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import { Doc, Descriptor } from 'src/app/app.model'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { _normalize, _sort } from 'src/app/utilities/functions'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'


@Component({
  selector: 'app-descriptors',
  templateUrl: './descriptors.component.html',
  styleUrls: ['./descriptors.component.scss']
})
export class DescriptorsComponent implements OnInit, OnChanges {

  @Input() doc: Doc
  @ViewChild('chipInput', { static: false }) chipInput: ElementRef<HTMLInputElement>
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete

  // Set up reactive formControl
  autocompleteChipList = new FormControl()
  // Set up values to use with chips
  addOnBlur = true
  color = 'primary'
  removable = true
  selectable = true
  separatorKeysCodes: number[] = [ENTER, COMMA]
  // Set up options array
  options: Descriptor[]
  // Define filteredOptins Array and Chips Array
  filteredOptions: Observable<Descriptor[]>
  chips = []
  // Optimize the autocomplete performance
  SHORT_LENGTH = 3
  MEDIUM_LENGTH = 15
  shortDescriptors: Descriptor[] = []  // searchable string length less or equal than SHORT_LENGTH
  mediumDescriptors: Descriptor[] = []  // searchable string length greater than SHORT_LENGTH and less or equal than MEDIUM_LENGTH
  longDescriptors: Descriptor[] = []  // searchable string length greater than MEDIUM_LENGTH
  // Improve user usability
  inactiveServiceMessage = 'El servicio está temporalmente inactivo. Por favor, contacta por email con el administrador de esta aplicación web: alejandro.asensio@bsc.es'
  userConfirm: boolean

  constructor(
    private api: ApiService,
    private auth: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.options = this.api.allDescriptors
    // Separate the short, medium and long descriptors
    this.shortDescriptors = this.api.allDescriptors.filter(descriptor => descriptor.termSpanish.length <= this.SHORT_LENGTH)
    // tslint:disable-next-line: max-line-length
    this.mediumDescriptors = this.api.allDescriptors.filter(descriptor => descriptor.termSpanish.length > this.SHORT_LENGTH && descriptor.termSpanish.length <= this.MEDIUM_LENGTH)
    this.longDescriptors = this.api.allDescriptors.filter(descriptor => descriptor.termSpanish.length > this.MEDIUM_LENGTH)
    // Filter descriptors as the user types in the input field
    this.filteredOptions = this.autocompleteChipList.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((value: string | null) => value ? this._filter(value, 'termSpanish') : this.api.getPrecodedDescriptors())
    )
  }

  /**
   * This 'descriptors' component implements OnChanges method so it can react to parent changes on its @Input() 'doc' property.
   */
  ngOnChanges() {
    // Update the chips list each time a different doc is selected
    this.chips = this.options.filter(descriptor => this.doc.decsCodes.includes(descriptor.termSpanish))
  }

  /**
   * Custom filter for the descriptors.
   */
  _filter(input: string, sortingKey: string) {
    // Ignore the starting and ending whitespaces
    input = input.trim()

    // If numeric, find the exact decsCode match
    if (!isNaN(Number(input))) {
      return this.api.allDescriptors.filter(descriptor => descriptor.decsCode === input && !this.chips.includes(descriptor))
    }

    // Normalize the lower-cased input
    input = _normalize(input.toLowerCase())

    // Choose the according subset of descriptors
    let subsetToFilter: Descriptor[]
    if (input.length <= this.SHORT_LENGTH) {
      subsetToFilter = this.shortDescriptors
    } else if (input.length > this.SHORT_LENGTH && input.length <= this.MEDIUM_LENGTH) {
      subsetToFilter = this.mediumDescriptors
    } else {
      subsetToFilter = this.longDescriptors
    }

    // Avoid showing the descriptors that are already added to doc
    subsetToFilter = subsetToFilter.filter(descriptor => !this.chips.some(chip => chip.decsCode === descriptor.decsCode))

    // Filter the descriptors by some properties
    const filtered = subsetToFilter.filter(descriptor =>
      // TODO REFACTOR: Hardcoded properties and very long multiline condition
      _normalize(descriptor.termSpanish.toLowerCase()).includes(input)
      || _normalize(descriptor.termEnglish.toLowerCase()).includes(input)
      || _normalize(descriptor.meshCode.toLowerCase()).includes(input)
      || _normalize(descriptor.synonyms.toLowerCase()).includes(input)
      // || _normalize(descriptor.definitionSpanish.toLowerCase()).includes(input)
    )

    // Return the sorted results by matching importance
    return _sort(filtered, input, sortingKey)
  }

  /**
   * When selecting a descriptor from the autocomplete displayed options (by clicking over it or pressing ENTER when it's highligthed),
   * add a descriptor to the visual list of chips and make a request through the app service to send it to backend.
   */
  addChip(event: MatAutocompleteSelectedEvent): void {
    // Get the selected descriptor from the event
    const selectedDescriptor: Descriptor = event.option.value
    // Add the descriptor to the chips list
    this.chips.push(selectedDescriptor)
    // Clear the typed text from the input field
    this.chipInput.nativeElement.value = ''
    this.autocompleteChipList.setValue('')
    // Add the clicked chip descriptor to database
    const descriptorToAdd = {
      decsCode: selectedDescriptor.decsCode,
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id
    }
    // this.api.addDescriptor(descriptorToAdd).subscribe()
    this.api.addDescriptor(descriptorToAdd).subscribe(
      response => {
        if (!response.success) {
          alert(this.inactiveServiceMessage)
        }
      }
    )
  }

  /**
   * When clicking over the cross ('x') icon inside a descriptor chip or pressing delete key when chip is selected,
   * remove the chip from the visual list and make a request through the app service to send it to backend.
   */
  removeChip(chip: Descriptor): void {
    // Remove chip from input field
    const index = this.chips.indexOf(chip)
    if (index >= 0) {
      this.chips.splice(index, 1)
    }
    // Remove the clicked chip descriptor from database
    const descriptorToRemove = {
      decsCode: chip.decsCode,
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id
    }
    this.api.removeDescriptor(descriptorToRemove).subscribe(
      response => {
        if (response.deletedCount !== 1) {
          alert(this.inactiveServiceMessage)
        }
      }
    )
    // Visual information to the user
    const snackBarRef = this.snackBar.open(`DeCS borrado: ${chip.termSpanish} (${chip.decsCode})`, 'DESHACER',
      { panelClass: 'success-dialog' }
    )
    // If the action button is clicked, re-add the recently removed descriptor
    snackBarRef.onAction().subscribe(() => {
      this.chips.push(chip)
      this.api.addDescriptor(descriptorToRemove).subscribe()
    })
  }

  /**
   * Open a confirmation dialog to confirm the removal of a descriptor from a document.
   */
  openConfirmDialog(chip: Descriptor): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        title: '¿Quieres borrar este descriptor?',
        content: `${chip.termSpanish} (${chip.decsCode})`,
        no: 'Cancelar',
        yes: 'Borrar'
      }
    })
    dialogRef.afterClosed().subscribe(result => result ? this.removeChip(chip) : null)
  }






  // =========================================================================================
  // @Input() doc: Doc

  // // Set up reactive formcontrol
  // autocompleteChipList: FormControl = new FormControl()
  // // Set up values to use with Chips
  // visible = true
  // selectable = true
  // removable = true
  // addOnBlur = true
  // // Set up Options Array
  // // options = [
  // //   { name: 'Lemon' },
  // //   { name: 'Lime' },
  // //   { name: 'Apple' },
  // // ]
  // options: Descriptor[]
  // // Define filteredOptins Array and Chips Array
  // filteredOptions = []
  // // filteredOptions: Observable<Descriptor[]>
  // chips = []

  // constructor(
  //   private api: ApiService,
  //   private auth: AuthService,
  //   public dialog: MatDialog,
  //   private snackBar: MatSnackBar
  // ) { }

  // ngOnInit() {
  //   // Set initial value of filteredOptions to all Options
  //   this.options = this.api.allDescriptors
  //   // this.filteredOptions = this.options
  //   // Subscribe to listen for changes to AutoComplete input and run filter
  //   this.autocompleteChipList.valueChanges.subscribe(val => {
  //     this.filterOptions(val)
  //   })
  //   // this.filteredOptions = this.autocompleteChipList.valueChanges.pipe(
  //   //   debounceTime(100),
  //   //   startWith(''),
  //   //   // map((value: string | null) => value ? this._filter(value, 'termSpanish') : this.api.getPrecodedDescriptors())
  //   //   map((value: string | null) => value ? this.filterOptions(value) : this.api.getPrecodedDescriptors())
  //   // )
  // }

  // filterOptions(text: string) {
  //   // Set filteredOptions array to filtered options
  //   this.filteredOptions = this.options
  //     .filter(obj => obj.termSpanish.toLowerCase().indexOf(text.toString().toLowerCase()) === 0)
  // }

  // addChip(event: MatAutocompleteSelectedEvent, input: any): void {
  //   // Define selection constant
  //   const selection = event.option.value
  //   // Add chip for selected option
  //   this.chips.push(selection)
  //   // Remove selected option from available options and set filteredOptions
  //   this.options = this.options.filter(obj => obj.termSpanish !== selection.termSpanish)
  //   this.filteredOptions = this.options
  //   // Reset the autocomplete input text value
  //   if (input) {
  //     input.value = ''
  //   }
  // }

  // removeChip(chip: any): void {
  //   // Find key of object in array
  //   const index = this.chips.indexOf(chip)
  //   // If key exists
  //   if (index >= 0) {
  //     // Remove key from chips array
  //     this.chips.splice(index, 1)
  //     // Add key to options array
  //     this.options.push(chip)
  //   }
  // }

}
