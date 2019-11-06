import { COMMA, ENTER } from '@angular/cdk/keycodes'
import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
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

  @Output() descriptorToEmit = new EventEmitter<Descriptor>()
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

  constructor(private appService: AppService) {
    this.allDescriptors = this.appService.getDescriptors()
    this.filteredDescriptors = this.descriptorCtrl.valueChanges.pipe(
      startWith(null),
      map((descriptor: string | null) => descriptor ? this._filter(descriptor) : this.allDescriptors.slice())
    )
  }

  private _filter(value: string): Descriptor[] {
    return this.allDescriptors.filter(descriptor => descriptor.termSpanish.toLowerCase().includes(value.toString().toLowerCase()))
  }

  add(event: MatChipInputEvent): void {
    // Add descriptor only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      // Add custom typed text [DISABLED]
      // const value = event.value
      // if ((value || '').trim()) {
      //   this.descriptors.push({
      //     id: 'DeCS inválido',
      //     termSpanish: value.trim(),
      //     addedOn: Date.now()
      //   })
      // }

      // Reset the input value
      event.input.value = event.input ? '' : null
      this.descriptorCtrl.setValue(null)
    }
  }

  remove(descriptor: Descriptor): void {
    const index = this.descriptors.indexOf(descriptor)
    if (index >= 0) {
      this.descriptors.splice(index, 1)
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedDescriptor: Descriptor = event.option.value

    this.descriptors.push(selectedDescriptor)
    // this.descriptors.push({
    //   id: selectedDescriptor.id,
    //   addedOn: Date.now()
    // })

    this.descriptorInput.nativeElement.value = ''
    this.descriptorCtrl.setValue(null)
    this.sendDescriptorToArticle(selectedDescriptor)
  }

  /**
   * Make an HTTP POST request with the selected descriptor
   */
  sendDescriptorToArticle(descriptor: Descriptor): void {
    this.descriptorToEmit.emit({
      id: descriptor.id,
      addedBy: 'A9', // It will be the logged user id
      addedOn: Date.now()
    })
  }

}
