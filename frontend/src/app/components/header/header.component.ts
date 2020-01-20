import { Component } from '@angular/core'
import { AuthService } from 'src/app/services/auth.service'
import { ApiService } from 'src/app/services/api.service'


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(public auth: AuthService) { }

}
