import { Component, OnInit } from '@angular/core'
import { Article, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'
import { TableColumn, Width, ButtonType } from 'simplemattable'
import { ArticleComponent } from '../article/article.component'
import { SlideToggleComponent } from '../slide-toggle/slide-toggle.component'
import { AbstractControl } from '@angular/forms'

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  article: Article
  articles: Article[]
  currentArticles: Article[]
  color: string
  // pastDateValidator: AbstractControl => control.value < this.article.decsCodes.length ? null : { }


  // Columns of articles simplemattable
  completedCol = new TableColumn<Article, 'completed'>('Completado', 'completed')
  // .withColFilter()
    .isDirectEdit(true)
    .withWidth(Width.pct(10))

  columns = [
    new TableColumn<Article, 'id'>('ID Artículo', 'id')
      .withColFilter()
      .withWidth(Width.pct(10)),
    // .withNgStyle((id, article) => ({ color: article.decsCodes.length ? '#669966' : '' })),
    // .withNgComponent(ArticleComponent)
    // .withNgComponentInput((component: ArticleComponent, data, dataParent) => component.article = dataParent),
    new TableColumn<Article, 'title'>('Título', 'title')
      .withColFilter()
      .withWidth(Width.pct(70))
      .isTextHiddenXs(true),
    // .withWidth(Width.pct(80))
    // .withTransform(title => title.length > 30 ? title.slice(0, 30) + '...' : title),

    // new TableColumn<Article, 'completed'>('Completado', 'completed')
    //   .withColFilter()
    //   .withWidth(Width.pct(20))
    //   .withNgComponent(SlideToggleComponent)
    //   .withNgComponentInput((component: SlideToggleComponent, data, dataParent) => component.checked = dataParent.completed),

    new TableColumn<Article, 'decsCodes'>('Núm. descriptores', 'decsCodes')
      .withColFilter()
      .withWidth(Width.pct(10))
      .withTransform(data => data.length.toString()),
    this.completedCol
  ]

  constructor(
    private appService: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()
    this.completedCol.withFormField(this.completedCol.getCheckboxFormField()
      // .withValidators([this.pastDateValidator])
    )
  }

  getArticles() {
    const userToSend: User = { id: this.auth.getUserDetails().identity.id }
    this.appService.getArticles(userToSend).subscribe(articles => {
      this.articles = articles
      this.currentArticles = this.articles.slice(0, 10)
    })
  }

  onPageChange($event) {
    this.currentArticles = this.articles.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize + $event.pageSize
    )
  }

  selectArticle(article: Article) {
    this.article = article
  }

  setColor(article: Article): string {
    return article.decsCodes.length ? '' : 'primary'
  }

}
