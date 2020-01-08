import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnInit, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
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
  // visible = true
  selectable = true
  removable = true
  addOnBlur = true
  separatorKeysCodes: number[] = [ENTER, COMMA]
  descriptorCtrl = new FormControl()  // text input form field to search among descriptors
  filteredDescriptors: Observable<Descriptor[]>  // suggested options
  descriptors: Descriptor[] = []  // chips list
  allDescriptors: Descriptor[]  // all available descriptors to pick
  SEARCH_MINIMUM_LENGTH = 4
  shortDescriptors: Descriptor[] = []  // descriptors with its termSpanish length less than SEARCH_MINIMUM_LENGTH
  inactiveServiceMessage = 'El servicio está temporalmente inactivo. Por favor, contacta por email con el administrador de esta aplicación web: alejandro.asensio@bsc.es'

  constructor(
    private appService: AppService,
    private auth: AuthenticationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // TEST
    // console.log(formatDate(Date.now(), 'yyyy-MM-ddTHH:mm:ss.SSS', 'en-US'))
    // this.appService.getDescriptorsFromTSV()

    // Get all descriptors from local JSON file
    this.appService.getDescriptors().subscribe(
      data => this.allDescriptors = data,
      error => console.error(error),
      () => {
        // Find the short termSpanish descriptors
        this.allDescriptors.forEach(descriptor => {
          if (descriptor.termSpanish.length < this.SEARCH_MINIMUM_LENGTH) {
            this.shortDescriptors.push(descriptor)
          }
        })

        // Filter descriptors on any typing change of input field
        this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
          debounceTime(100),
          startWith(''),

          // https://material.angular.io/components/autocomplete
          map((value: string | null) => value ? this._filter(value) : this.allDescriptors.slice(0, 10)),

          // https://stackoverflow.com/questions/45229409/speeding-up-angular-material-autocomplete-or-alternatives#comment93317064_46289297
          // map((value: string | null) => value.length >= this.SEARCH_MINIMUM_LENGTH ? this._filter(value) : [])
          // map(
          //   (value: string | null) => {
          //     if (value.length === 0) {
          //       return []
          //     } else if (value.length < this.SEARCH_MINIMUM_LENGTH) {
          //       return this.shortDescriptors
          //     } else {
          //       return this._filter(value)
          //     }
          //   }
          // )
        )
      }
    )

  }

  /**
   * This descriptors component implements OnChanges so it can react to parent changes on doc attribute.
   */
  ngOnChanges() {
    // Reset the chips list
    this.descriptors = []

    // Init the input field with the current descriptors list from parent
    if (this.doc.decsCodes) {
      this.doc.decsCodes.forEach(decsCode => {
        this.descriptors.push(this.appService.findDescriptorByDecsCode(decsCode))
      })
    }
  }

  /**
   * Custom filter function that matches any attribute of a descriptor in a case-insensitive way.
   * @param value Manually typed text (string) or entire object (Descriptor) when selected from autocomplete list.
   */
  private _filter(value: string | Descriptor): Descriptor[] {
    // Prepare the value to filter
    const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value
    const normalizedValue = this._normalize(stringifiedValue.toLowerCase().trim())

    // Optimize the autocomplete performance by distinguishing a SEARCH_MINIMUM_LENGTH.
    if (normalizedValue.length < this.SEARCH_MINIMUM_LENGTH) {
      return this.shortDescriptors.filter(descriptor =>
        // Prevent listing the already added decsCodes to the current doc.
        !this.descriptors.some(d => d.decsCode.toLowerCase() === descriptor.decsCode) && (
          // Filter by some specific fields.
          this._normalize(descriptor.decsCode.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.termSpanish.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.termEnglish.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.meshCode.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.synonyms.toLowerCase()).includes(normalizedValue)
        )
      )
    } else {
      return this.allDescriptors.filter(descriptor =>
        !this.descriptors.some(d => d.decsCode.toLowerCase() === descriptor.decsCode) && (
          this._normalize(descriptor.decsCode.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.termSpanish.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.termEnglish.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.meshCode.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.synonyms.toLowerCase()).includes(normalizedValue)
        )
      )
    }
  }

  /**
   * Remove accents or tildes in the given string.
   * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
   * @param text string that may contain accents/tildes
   */
  private _normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

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
