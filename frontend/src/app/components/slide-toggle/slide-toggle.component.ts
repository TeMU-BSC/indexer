import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.css']
})
export class SlideToggleComponent {

  color = 'accent'
  checked = false
  disabled = false

}
