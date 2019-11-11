import { Component } from '@angular/core'
import { Annotator } from './app.model'
import { AppService } from './app.service'
import { Router } from '@angular/router'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // currentAnnotator: Annotator

  // constructor(
  //   private router: Router,
  //   private appService: AppService) {
  //   this.appService.currentAnnotator.subscribe(annotator => this.currentAnnotator = annotator)
  // }

  // logout() {
  //   this.appService.logout()
  //   alert('You have been logout successfully.')
  //   this.router.navigate(['/login'])
  // }

}
