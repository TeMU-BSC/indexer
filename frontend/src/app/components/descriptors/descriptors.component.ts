import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnInit, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { MatSnackBar } from '@angular/material'
import { Observable } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'
import { Article, Descriptor } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { formatDate } from '@angular/common'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-descriptors',
  templateUrl: './descriptors.component.html',
  styleUrls: ['./descriptors.component.css']
})
export class DescriptorsComponent implements OnInit, OnChanges {

  visible = true
  selectable = true
  removable = true
  addOnBlur = true
  separatorKeysCodes: number[] = [ENTER, COMMA]
  descriptorCtrl = new FormControl()  // input form field to search among descriptors
  filteredDescriptors: Observable<Descriptor[]>  // filtered options to easily pick an appropiate descriptor
  descriptors: Descriptor[] = []  // chips list
  allDescriptors: Descriptor[]  // all available descriptors to pick
  @ViewChild('descriptorInput', { static: false }) descriptorInput: ElementRef<HTMLInputElement>
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete
  @Input() article: Article
  toHighlight = ''
  isLoading = false

  constructor(
    private appService: AppService,
    private auth: AuthenticationService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // TEST
    // this.appService.getDescriptorsFromTSV()

    // Get all descriptors from local JSON file
    this.appService.getDescriptors().subscribe(data => this.allDescriptors = data)

    // Filter descriptors on any typing change of input field
    this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
      debounceTime(100),
      startWith(''),
      // https://material.angular.io/components/autocomplete
      // map((value: string | null) => value ? this._filter(value) : this.allDescriptors.slice()),

      // https://stackoverflow.com/questions/45229409/speeding-up-angular-material-autocomplete-or-alternatives#comment93317064_46289297
      map((value: string | null) => value.length >= 3 ? this._filter(value) : [])
    )
  }

  /**
   * This descriptors component implements OnChanges so it can react to parent changes on article attribute.
   */
  ngOnChanges() {
    // Reset the chips list
    this.descriptors = []

    // Init the input field with the current descriptors list from parent
    if (this.article.decsCodes) {
      this.article.decsCodes.forEach(decsCode => {
        this.descriptors.push(this.appService.findDescriptorByDecsCode(decsCode))
      })
    }
  }

  /**
   * Custom filter function that matches any attribute of a descriptor in a case-insensitive way.
   * @param value Manually typed text (string) or entire object (Descriptor) when selected from autocomplete list.
   */
  private _filter(value: string | Descriptor): Descriptor[] {
    // Highlight match substring
    this.toHighlight = value.toString()

    // Prepare the value to filter
    const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value
    // const normalizedValue = this._normalize(stringifiedValue.toLowerCase().trim())
    const normalizedValue = this._normalize(stringifiedValue.toLowerCase())

    // [Option 1] Filter by the whole stringified and lowercased descriptor object
    // return this.allDescriptors.filter(
    //   descriptor => {
    //     // !JSON.stringify(this.descriptors).includes(normalizedValue) &&
    //     this._normalize(JSON.stringify(descriptor).toLowerCase()).includes(normalizedValue)
    //   }
    // )

    // [Option 2] Filter only by some attributes
    return this.allDescriptors.filter(
      descriptor =>
        // Not showing the already added descriptors to this article regarding the current descriptor decsCode
        // tslint:disable-next-line: no-unused-expression
        !this.descriptors.some(d => d.decsCode.toLowerCase() === descriptor.decsCode) &&

        // Keep filtering by these fields
        (
          this._normalize(descriptor.decsCode.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.termSpanish.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.termEnglish.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.meshCode.toLowerCase()).includes(normalizedValue) ||
          this._normalize(descriptor.synonyms.toLowerCase()).includes(normalizedValue)
        )
    )
  }

  /**
   * Remove accents or tildes in the given string.
   * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
   * @param text string that may contain accents/tildes
   */
  private _normalize(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  /**
   * Add descriptor only when MatAutocomplete is not open
   * to make sure this does not conflict with OptionSelected Event.
   */
  add(event: MatChipInputEvent, descriptorToReAdd?: Descriptor): void {
    if (!this.matAutocomplete.isOpen) {
      // [DISABLED] Add custom typed text
      // const value = event.value
      // if ((value || '').trim()) {
      //   this.descriptors.push(value)
      // }

      // Clear the text in input field
      if (event) {
        event.input.value = event.input ? '' : null
      }

      // Add a descriptor that has been recently removed but inmediately undone
      // by clicking the action button of the snackbar.
      if (descriptorToReAdd) {
        this.descriptors.push(descriptorToReAdd)

        // this.appService.addDescriptor({
        //   decsCode: descriptorToReAdd.decsCode,
        //   userId: this.auth.getUserDetails().identity.id, // TODO: Change it to the current logged user id
        //   addedTo: this.article.id,
        // })

        // console.log(formatDate(Date.now(), 'yyyy-MM-ddTHH:mm:ss.SSS', 'en-US'))
      }

      this.descriptorCtrl.setValue('')
    }
  }

  remove(descriptor: Descriptor): void {
    // Remove chip from input field
    const index = this.descriptors.indexOf(descriptor)
    if (index >= 0) {
      this.descriptors.splice(index, 1)
    }

    // Remove the clicked chip descriptor from database
    const descriptorToRemove = {
      decsCode: descriptor.decsCode,
      userId: this.auth.getUserDetails().identity.id,
      articleId: this.article.id
    }

    // --> TODO: Don't remove, just wait for the snackbar to timeout automatic... (Vicky's idea)
    // this.appService.removeDescriptor(descriptorToRemove).subscribe()

    // Timeout of some seconds to be able to undo the removal
    const snackBarRef = this.snackBar.open(`Borrado: ${descriptor.termSpanish} (${descriptor.decsCode})`, 'Deshacer')

    // If clicked the 'Undo' action button,
    // snackBarRef.onAction().subscribe(() => this.add(null, descriptor))

    // If not clicked the 'Undo' action button, finally remove the descriptor
    snackBarRef.afterDismissed().subscribe(() => this.appService.removeDescriptor(descriptorToRemove).subscribe())
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // Get the selected descriptor from the event
    const selectedDescriptor: Descriptor = event.option.value

    // Add the descriptor to the chips list
    this.descriptors.push(selectedDescriptor)

    // Clear the typed text from the input field
    this.descriptorInput.nativeElement.value = ''
    this.descriptorCtrl.setValue('')

    // Remove the clicked chip descriptor from database
    const descriptorToAdd = {
      decsCode: selectedDescriptor.decsCode,
      userId: this.auth.getUserDetails().identity.id,
      articleId: this.article.id
    }
    this.appService.addDescriptor(descriptorToAdd).subscribe()

    // Viasual feedback to user
    // this.snackBar.open(`Añadido: ${selectedDescriptor.termSpanish} (${selectedDescriptor.decsCode})`, 'OK', { duration: 5000 })
  }

}
