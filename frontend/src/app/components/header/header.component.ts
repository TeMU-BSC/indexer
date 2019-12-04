import { Component } from '@angular/core'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  title = 'Indizador de Descriptores de Ciencias de la Salud (DeCS)'
  // title = 'Indizador DeCS'

  constructor(public auth: AuthenticationService) { }

}
