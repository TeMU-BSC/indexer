import { Component } from '@angular/core'
import { faLinkedinIn, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  faLinkedin = faLinkedinIn
  faGithub = faGithub
  faTwitter = faTwitter
}
