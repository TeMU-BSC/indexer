// https://alligator.io/angular/reactive-forms-formarray-dynamic-fields/

import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormArray } from '@angular/forms'

@Component({
  selector: 'app-dynamic-fields',
  templateUrl: './dynamic-fields.component.html',
  styleUrls: ['./dynamic-fields.component.css']
})
export class DynamicFieldsComponent implements OnInit {

  orderForm: FormGroup
items: FormArray

constructor(private formBuilder: FormBuilder) {}

ngOnInit() {
  this.orderForm = this.formBuilder.group({
    customerName: '',
    email: '',
    items: this.formBuilder.array([ this.createItem() ])
  })
}

createItem(): FormGroup {
  return this.formBuilder.group({
    name: '',
    description: '',
    price: ''
  })
}

addItem(): void {
  this.items = this.orderForm.get('items') as FormArray
  this.items.push(this.createItem())
}

}
