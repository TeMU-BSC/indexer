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

// TODO: Reordenar la lista completa de DeCS (JSON) para que los descriptores más comunes aparezcan
//       primero en las sugerencias del autocomplete.

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
  precodedDescriptors: Descriptor[]
  allDescriptors: Descriptor[]  // all available descriptors to pick
  filteredDescriptors: Observable<Descriptor[]>  // suggested options in autocomplete
  descriptors: Descriptor[] = []  // visual chips list

  // Optimize the autocomplete performance
  SHORT_LENGTH = 3
  MEDIUM_LENGTH = 10
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

  /**
   * Custom filter that matches any attribute of a descriptor in a case-insensitive way and ignoring tildes or typographic accents.
   * @param value Manually typed text (string) or entire object (Descriptor) when selected from autocomplete list.
   */
  private _filter(value: string | Descriptor): Descriptor[] {
    // Prepare the value to filter
    const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value
    const normalizedValue = this._normalize(stringifiedValue.toLowerCase().trim())

    // Optimize autocomplete performance by filtering different arrays depending on the current searching string length
    if (normalizedValue.length === 0) {
      return this._customFilterByProperty(this.precodedDescriptors, normalizedValue)
    } else if (normalizedValue.length <= this.SHORT_LENGTH) {
      return this._customFilterByProperty(this.shortDescriptors, normalizedValue)
    } else if (normalizedValue.length > this.SHORT_LENGTH
      && normalizedValue.length <= this.MEDIUM_LENGTH) {
        return this._customFilterByProperty(this.mediumDescriptors, normalizedValue)
    } else {
      return this._customFilterByProperty(this.longDescriptors, normalizedValue)
    }
  }

  /**
   * Custom filter to prevent showing in autocomplete the decsCodes that are already added, filtering by hardcoded properties.
   */
  private _customFilterByProperty(descriptorArray: Descriptor[], normalizedValue: string): Descriptor[] {
    return descriptorArray.filter(descriptor =>
      // Very long multiline condition
      !this.descriptors.some(d => d.decsCode.toLowerCase() === descriptor.decsCode) && (
        this._normalize(descriptor.decsCode.toLowerCase()).includes(normalizedValue) ||
        this._normalize(descriptor.termSpanish.toLowerCase()).includes(normalizedValue) ||
        this._normalize(descriptor.termEnglish.toLowerCase()).includes(normalizedValue) ||
        this._normalize(descriptor.meshCode.toLowerCase()).includes(normalizedValue) ||
        this._normalize(descriptor.synonyms.toLowerCase()).includes(normalizedValue)
      )
    )
  }

  /**
   * Remove typographic accents or tildes in the given string.
   * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
   * @param text string that may contain accents/tildes
   */
  private _normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  ngOnInit() {
    // TEST format dates
    // console.log(formatDate(Date.now(), 'yyyy-MM-ddTHH:mm:ss.SSS', 'en-US'))

    // TEST get descriptors directly from the TSV file (avoiding conversion to intermediate JSON file)
    // this.appService.getDescriptorsFromTSV()

    // Get all descriptor objects
    this.allDescriptors = this.appService.allDescriptors

    // Get the precoded descriptors
    this.precodedDescriptors = this.appService.getPrecodedDescriptors()

    // Separate the short, medium and long descriptors
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

    // Filter descriptors as the user types in the input field
    this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      map((value: string | null) => this._filter(value)),

      // https://material.angular.io/components/autocomplete
      // map((value: string | null) => value ? this._filter(value) : this.allDescriptors.slice(0, 10)),

      // https://stackoverflow.com/questions/45229409/speeding-up-angular-material-autocomplete-or-alternatives#comment93317064_46289297
      // map((value: string | null) => value.length >= this.SHORT_LENGTH ? this._filter(value) : [])
    )
  }

  /**
   * This 'descriptors' component implements OnChanges method so it can react to parent changes on 'doc' attribute.
   */
  ngOnChanges() {
    // Reset the chips list
    this.descriptors = []

    // Fill the chips list
    this.initChipsList()
  }

  /**
   * Initialize the input field with the current descriptors list of the selected doc.
   */
  initChipsList() {
    if (this.doc.decsCodes) {
      this.doc.decsCodes.forEach(decsCode => {
        this.descriptors.push(this.appService.findDescriptorByDecsCode(decsCode))
      })
    }
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
