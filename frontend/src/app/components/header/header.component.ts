import { Component } from '@angular/core'
import { AuthService } from 'src/app/services/auth.service'
import { DocsComponent } from '../docs/docs.component'
import { AppService } from 'src/app/services/app.service'


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(
    public auth: AuthService,
    public app: AppService
  ) { }

}
