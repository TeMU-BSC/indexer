import { Component, Input } from '@angular/core'
import { Article } from 'src/app/app.model'
import { MatSlideToggleChange, MatSnackBar } from '@angular/material'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent {

  @Input() article: Article
  // completedArticle: string

  constructor(
    private appService: AppService,
    private auth: AuthenticationService,
    private snackBar: MatSnackBar
  ) { }

  /**
   * If article is uncompleted, mark as completed; and the other way around.
   */
  // onChange(event: MatSlideToggleChange): void {
  //   if (!this.article.decsCodes.length) {
  //     // Warn the user that DeCS list is empty
  //     this.snackBar.open('Atención: El artículo debe tener al menos un DeCS para marcarlo como completado.', 'OK')
  //     // and change back the toggle slide
  //     // console.log(this.article.completed)
  //     // this.article.completed = false
  //   } else {
  //     // Visualy toggle the completed property (true / false)
  //     this.article.completed = event.checked
  //     // Make that change permanent to database
  //     const articleToMark = {
  //       userId: this.auth.getUserDetails().identity.id,
  //       articleId: this.article.id
  //     }
  //     if (this.article.completed) {
  //       this.appService.addCompletedArticle(articleToMark).subscribe()
  //     } else {
  //       this.appService.removeCompletedArticle(articleToMark).subscribe()
  //     }
  //   }
  // }

  /**
   * If article is uncompleted, mark as completed; and the other way around.
   */
  onChange(event: MatSlideToggleChange): void {
    // Visualy toggle the completed property (true / false)
    this.article.completed = event.checked

    // Make that change permanent to database
    const articleToMark = {
      userId: this.auth.getUserDetails().identity.id,
      articleId: this.article.id
    }
    if (this.article.completed) {
      this.appService.addCompletedArticle(articleToMark).subscribe()
    } else {
      this.appService.removeCompletedArticle(articleToMark).subscribe()
    }
  }

}
