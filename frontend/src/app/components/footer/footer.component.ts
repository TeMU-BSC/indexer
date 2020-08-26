import { Component } from '@angular/core'
import { Links } from 'src/app/utilities/links'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  links = Links

}
