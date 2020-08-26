import { Component } from '@angular/core'
import { AuthService } from 'src/app/services/auth.service'
import { Links } from 'src/app/utilities/links'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  links = Links

  constructor(public auth: AuthService) { }

}
