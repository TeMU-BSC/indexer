import { Component } from '@angular/core'
import { AuthService } from 'src/app/services/auth.service'
import { Links } from 'src/app/utilities/links'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  links = Links

  constructor(public auth: AuthService) { }

}
