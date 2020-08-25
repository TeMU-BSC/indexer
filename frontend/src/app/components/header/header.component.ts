import { Component } from '@angular/core'
import { AuthService } from 'src/app/services/auth.service'
import { bvsSearch } from 'src/app/utilities/links'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  bvsSearch = bvsSearch

  constructor(public auth: AuthService) { }

}
