import { Component, Input } from '@angular/core'
import { Article } from 'src/app/app.model'
import { MatSlideToggleChange, MatSnackBar } from '@angular/material'

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent {

  @Input() article: Article
  completedArticle: string

  constructor(private snackBar: MatSnackBar) { }

  /**
   * If article is uncompleted, mark as completed; and the other way around.
   */
  onChange(event: MatSlideToggleChange): void {
    // Check if descriptors list is empty
    // if (!this.article.decsCodes.length) {
    //   this.snackBar.open('Atención: No se puede marcar como completado un artículo sin descriptores.', 'OK')
    // } else {
    //   this.article.completed = event.checked
    // }

    this.article.completed = event.checked
  }

}
