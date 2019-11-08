import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Input, OnInit, OnChanges } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { Observable } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'
import { Descriptor, Article } from 'src/app/app.model'
import { AppService } from 'src/app/app.service'
import { MatSnackBar } from '@angular/material'

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
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // TEST
    // this.appService.getDescriptorsFromTSV()

    // Get all descriptors from local JSON file
    this.appService.getDescriptors().subscribe(data => this.allDescriptors = data)

    // Filter descriptors on any typing change of input field
    this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
      debounceTime(300),
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
    // Init the input field with the current descriptors list from parent
    if (this.article.descriptors) {
      this.article.descriptors.forEach(decsCode => {
        this.descriptors.push(this.appService.getDescriptorByDecsCode(decsCode))
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

    // Filter by the whole stringified and lowercased descriptor object
    // return this.allDescriptors.filter(descriptor => this._normalize(JSON.stringify(descriptor).toLowerCase()).includes(normalizedValue))

    // Filter only by some attributes
    return this.allDescriptors.filter(descriptor =>
      this._normalize(descriptor.decsCode.toLowerCase()).includes(normalizedValue) ||
      this._normalize(descriptor.termSpanish.toLowerCase()).includes(normalizedValue) ||
      this._normalize(descriptor.termEnglish.toLowerCase()).includes(normalizedValue) ||
      this._normalize(descriptor.meshCode.toLowerCase()).includes(normalizedValue) ||
      this._normalize(descriptor.synonyms.toLowerCase()).includes(normalizedValue)
    )
  }

  /**
   * Remove accents or tildes in the given string.
   * https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
   * @param value string that may contain accents (tildes)
   */
  private _normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  /**
   * Add descriptor only when MatAutocomplete is not open
   * to make sure this does not conflict with OptionSelected Event.
   */
  add(event: MatChipInputEvent, descriptor?: Descriptor): void {
    if (!this.matAutocomplete.isOpen) {
      // [DISABLED] Add custom typed text
      // const value = event.value
      // if ((value || '').trim()) {
      //   this.descriptors.push({
      //     decsCode: 'DeCS inválido',
      //     termSpanish: value.trim(),
      //     addedOn: Date.now()
      //   })
      // }

      // Clear the text in input field
      if (event) {
        event.input.value = event.input ? '' : null
      }

      // Add a descriptor that has been recently removed but inmediately undone
      // by clicking the action button of the snackbar.
      if (descriptor) {
        this.descriptors.push(descriptor)
      }

      // this.descriptorCtrl.setValue(null)
      this.descriptorCtrl.setValue('')
    }
  }

  remove(descriptorToRemove: Descriptor): void {
    // Remove chip from input field
    const index = this.descriptors.indexOf(descriptorToRemove)
    if (index >= 0) {
      this.descriptors.splice(index, 1)
    }

    // Remove the selected descriptor from database
    this.removeDescriptorFromDatabase({
      decsCode: descriptorToRemove.decsCode,
      removedBy: 'A9', // TODO: Change it to the current logged user id
      removedOn: Date.now() / 1000, // seconds
      articleId: this.article._id
    })

    // Viasual feedback to user
    const snackBarRef = this.snackBar.open('¡Descriptor borrado!', 'Deshacer', { duration: 10000 })
    snackBarRef.onAction().subscribe(() => this.add(null, descriptorToRemove))
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // Get the selected descriptor from the event
    const selectedDescriptor: Descriptor = event.option.value

    // Add the descriptor to the chips list
    this.descriptors.push(selectedDescriptor)

    // Clear the typed text from the input field
    this.descriptorInput.nativeElement.value = ''
    this.descriptorCtrl.setValue('')

    // Add the selected descriptor to database
    this.addDescriptorToDatabase({
      decsCode: selectedDescriptor.decsCode,
      addedBy: 'A9', // TODO: Change it to the current logged user id
      addedOn: Date.now() / 1000, // seconds
      articleId: this.article._id
    })

    // Viasual feedback to user
    this.snackBar.open('¡Descriptor añadido!', 'OK', { duration: 5000 })
  }

  addDescriptorToDatabase(descriptor: Descriptor) {
    // this.appService.addDescriptor(descriptor).subscribe(response => console.log(response))
    // console.log(this.appService.addDescriptor(descriptor))
    console.log(descriptor)
  }

  removeDescriptorFromDatabase(descriptor: Descriptor) {
    // this.appService.removeDescriptor(descriptor).subscribe(response => console.log(response))
    // console.log(this.appService.removeDescriptor(descriptor))
    console.log(descriptor)

  }



}