import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete'
import { MatChipInputEvent } from '@angular/material/chips'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Descriptor, Article } from 'src/app/app.model'
import { AppService } from 'src/app/app.service'

@Component({
  selector: 'app-descriptors',
  templateUrl: './descriptors.component.html',
  styleUrls: ['./descriptors.component.css']
})
export class DescriptorsComponent {

  visible = true
  selectable = true
  removable = true
  addOnBlur = true
  separatorKeysCodes: number[] = [ENTER, COMMA]
  descriptorCtrl = new FormControl()
  filteredDescriptors: Observable<Descriptor[]>
  descriptors: Descriptor[] = []
  allDescriptors: Descriptor[]

  @ViewChild('descriptorInput', { static: false }) descriptorInput: ElementRef<HTMLInputElement>
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete

  @Input() article: Article
  @Output() descriptorToAdd = new EventEmitter<Descriptor>()
  @Output() descriptorToRemove = new EventEmitter<Descriptor>()

  constructor(private appService: AppService) {
    this.allDescriptors = this.appService.getDescriptors()

    // Filter descriptors on any typing change of input field
    this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => value ? this._filter(value) : this.allDescriptors.slice())
    )
  }

  /**
   * Custom filter function that matches any attribute of a descriptor in a case-insensitive way.
   * @param value Manually typed text (string) or entire object (Descriptor) when selected from autocomplete list.
   */
  private _filter(value: string | Descriptor): Descriptor[] {
    const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value
    const normalizedValue = this._normalize(stringifiedValue.toLowerCase().trim())
    return this.allDescriptors.filter(descriptor => this._normalize(JSON.stringify(descriptor).toLowerCase()).includes(normalizedValue))
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
  add(event: MatChipInputEvent): void {
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
      event.input.value = event.input ? '' : null
      this.descriptorCtrl.setValue(null)
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
      removedOn: Date.now(),
      articleId: this.article.id
    })
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // Get the selected descriptor from the event
    const selectedDescriptor: Descriptor = event.option.value

    // Add the descriptor to the chips list
    this.descriptors.push(selectedDescriptor)

    // Clear the typed text from the input field
    this.descriptorInput.nativeElement.value = ''
    this.descriptorCtrl.setValue(null)

    // Add the selected descriptor to database
    this.addDescriptorToDatabase({
      decsCode: selectedDescriptor.decsCode,
      addedBy: 'A9', // TODO: Change it to the current logged user id
      addedOn: Date.now(),
      articleId: this.article.id
    })
  }

  addDescriptorToDatabase(descriptor: Descriptor) {
    // this.appService.addDescriptor(descriptor).subscribe(response => console.log(response))
    console.log(this.appService.addDescriptor(descriptor))
  }

  removeDescriptorFromDatabase(descriptor: Descriptor) {
    // this.appService.removeDescriptor(descriptor).subscribe(response => console.log(response))
    console.log(this.appService.removeDescriptor(descriptor))
  }

}
