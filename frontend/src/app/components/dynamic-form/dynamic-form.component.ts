import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormArray, ValidatorFn } from '@angular/forms'

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent {

  form: FormGroup

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      published: true,
      credentials: this.fb.array([]),
    })
  }

  addCreds() {
    const creds = this.form.controls.credentials as FormArray
    creds.push(this.fb.group({
      username: '',
      password: '',
    }))
  }

  get published() {
    return this.form.controls.published.value
  }
  get credentials() {
    return this.form.controls.credentials.value
  }

}
