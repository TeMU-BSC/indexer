import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnInit, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatSnackBar } from '@angular/material'
import { Observable } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'
import { Doc, Descriptor } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'
import { normalize, orderByKey, orderByStart } from 'src/app/utilities/functions'


@Component({
  selector: 'app-descriptors',
  templateUrl: './descriptors.component.html',
  styleUrls: ['./descriptors.component.css']
})
export class DescriptorsComponent implements OnInit, OnChanges {

  @Input() doc: Doc
  @ViewChild('descriptorInput', { static: false }) descriptorInput: ElementRef<HTMLInputElement>
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete

  // Visual chips list
  selectable = true
  removable = true
  addOnBlur = true
  separatorKeysCodes: number[] = [ENTER, COMMA]

  // Input field control
  descriptorCtrl = new FormControl()  // text input form field to search among descriptors
  precodedDescriptors: Descriptor[]  // frequently used
  allDescriptors: Descriptor[]  // all available descriptors to pick
  filteredDescriptors: Observable<Descriptor[]>  // suggested options in autocomplete
  descriptors: Descriptor[] = []  // visual chips list
  orderingKey = 'termSpanish'

  // Optimize the autocomplete performance
  SHORT_LENGTH = 3
  MEDIUM_LENGTH = 15
  shortDescriptors: Descriptor[] = []  // searchable string length less or equal than SHORT_LENGTH
  mediumDescriptors: Descriptor[] = []  // searchable string length greater than SHORT_LENGTH and less or equal than MEDIUM_LENGTH
  longDescriptors: Descriptor[] = []  // searchable string length greater than MEDIUM_LENGTH

  // Feedback to user
  inactiveServiceMessage = 'El servicio está temporalmente inactivo. Por favor, contacta por email con el administrador de esta aplicación web: alejandro.asensio@bsc.es'

  constructor(
    private appService: AppService,
    private auth: AuthenticationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // Get all descriptor objects
    this.allDescriptors = this.appService.allDescriptors

    // Get the precoded descriptors
    this.precodedDescriptors = this.appService.getPrecodedDescriptors()

    // Separate the short, medium and long descriptors, accumulation the previous ones to the next
    this.allDescriptors.forEach(descriptor => {
      if (descriptor.termSpanish.length <= this.SHORT_LENGTH) {
        this.shortDescriptors.push(descriptor)
      } else if (descriptor.termSpanish.length > this.SHORT_LENGTH
        && descriptor.termSpanish.length <= this.MEDIUM_LENGTH) {
        this.mediumDescriptors.push(descriptor)
      } else {
        this.longDescriptors.push(descriptor)
      }
    })

    // Check the length of the groups
    // console.log('short', this.shortDescriptors)
    // console.log('medium', this.mediumDescriptors)
    // console.log('long', this.longDescriptors)
    // console.log('all', this.allDescriptors)

    // Filter descriptors as the user types in the input field
    this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((value: string | null) => value ? this._filter(value) : this.precodedDescriptors)
    )
  }

  /**
   * This 'descriptors' component implements OnChanges method so it can react to parent changes on 'doc' attribute.
   */
  ngOnChanges() {
    // Reset the chips list
    this.descriptors = []

    // Initialize the input field with the current descriptors list of the selected doc
    if (this.doc.decsCodes) {
      this.doc.decsCodes.forEach(decsCode => {
        this.descriptors.push(this.appService.findDescriptorByDecsCode(decsCode))
      })
    }
  }

  /**
   * Custom filter that matches any attribute of a descriptor in a case-insensitive way and ignoring tildes or typographic accents.
   * @param value Manually typed text (string) or entire object (Descriptor) when selected from autocomplete list.
   */
  private _filter(value: string | Descriptor): Descriptor[] {
    // Prepare the value to filter
    const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value
    const normalizedValue = normalize(stringifiedValue.toLowerCase().trim())

    // Prioritize number inputs (decsCodes)
    const isNumeric = testingString => !isNaN(Number(testingString))
    if (isNumeric(normalizedValue)) {
      return this.allDescriptors.filter(descriptor => descriptor.decsCode === normalizedValue)
    }

    // Optimize autocomplete performance by filtering different arrays depending on the current searching string length
    if (normalizedValue.length <= this.SHORT_LENGTH) {
      return orderByKey(this.filterBySomeProperties(this.shortDescriptors, normalizedValue), this.orderingKey)
      // return this.putObjectItemFirst(this.filterBySomeProperties(this.shortDescriptors, normalizedValue), 'termSpanish', normalizedValue)
    } else if (normalizedValue.length > this.SHORT_LENGTH
      && normalizedValue.length <= this.MEDIUM_LENGTH) {
      return orderByKey(this.filterBySomeProperties(this.mediumDescriptors, normalizedValue), this.orderingKey)
    } else {
      return orderByKey(this.filterBySomeProperties(this.longDescriptors, normalizedValue), this.orderingKey)
    }
  }

  /**
   * Custom filter to prevent showing in autocomplete the decsCodes that are already added, filtering by hardcoded properties.
   */
  filterBySomeProperties(array: any[], normalizedValue?: string): any[] {
    return array.filter(descriptor =>
      // Very long multiline condition
      !this.descriptors.some(d => d.decsCode.toLowerCase() === descriptor.decsCode) && (
        normalize(descriptor.decsCode.toLowerCase()).includes(normalizedValue) ||
        normalize(descriptor.termSpanish.toLowerCase()).includes(normalizedValue) ||
        normalize(descriptor.termEnglish.toLowerCase()).includes(normalizedValue) ||
        normalize(descriptor.meshCode.toLowerCase()).includes(normalizedValue) ||
        normalize(descriptor.synonyms.toLowerCase()).includes(normalizedValue)
      )
    )
  }

  /**
   * When clicking over the cross ('x') icon inside a descriptor chip or pressing delete key when chip is selected,
   * remove the chip from the visual list and make a request through the app service to send it to backend.
   */
  remove(descriptor: Descriptor): void {
    if (confirm(`¿Quieres borrar el descriptor "${descriptor.termSpanish} (${descriptor.decsCode})"?`)) {
      // Remove chip from input field
      const index = this.descriptors.indexOf(descriptor)
      if (index >= 0) {
        this.descriptors.splice(index, 1)
      }

      // Remove the clicked chip descriptor from database
      const descriptorToRemove = {
        decsCode: descriptor.decsCode,
        userId: this.auth.getCurrentUser().id,
        docId: this.doc.id
      }
      this.appService.removeDescriptor(descriptorToRemove).subscribe(
        response => {
          if (response.deletedCount !== 1) {
            alert(this.inactiveServiceMessage)
          }
        }
      )

      // Visual information to the user
      const snackBarRef = this.snackBar.open(`Borrado: ${descriptor.termSpanish} (${descriptor.decsCode})`, 'DESHACER')

      // If the action button is clicked, re-add the recently removed descriptor
      snackBarRef.onAction().subscribe(() => {
        this.descriptors.push(descriptor)
        this.appService.addDescriptor(descriptorToRemove).subscribe()
      })
    }
  }

  /**
   * When selecting a descriptor from the autocomplete displayed options (by clicking over it or pressing ENTER when it's highligthed),
   * add a descriptor to the visual list of chips and make a request through the app service to send it to backend.
   */
  selected(event: MatAutocompleteSelectedEvent): void {
    // Get the selected descriptor from the event
    const selectedDescriptor: Descriptor = event.option.value

    if (this.descriptors.includes(selectedDescriptor)) {
      this.snackBar.open(`Atención: El descriptor precodificado ${selectedDescriptor.termSpanish} (${selectedDescriptor.decsCode}) ya está añadido.`, 'ENTENDIDO')
      return
    }

    // Add the descriptor to the chips list
    this.descriptors.push(selectedDescriptor)

    // Clear the typed text from the input field
    this.descriptorInput.nativeElement.value = ''
    this.descriptorCtrl.setValue('')

    // Add the clicked chip descriptor to database
    const descriptorToAdd = {
      decsCode: selectedDescriptor.decsCode,
      userId: this.auth.getCurrentUser().id,
      docId: this.doc.id
    }
    // this.appService.addDescriptor(descriptorToAdd).subscribe()
    this.appService.addDescriptor(descriptorToAdd).subscribe(
      response => {
        if (!response.success) {
          alert(this.inactiveServiceMessage)
        }
      }
    )
  }

}
