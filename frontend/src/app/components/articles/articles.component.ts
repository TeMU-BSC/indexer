import { Component, OnInit } from '@angular/core'
import { Article, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'
import { TableColumn, Width, ButtonType } from 'simplemattable'
import { ArticleComponent } from '../article/article.component'
import { SlideToggleComponent } from '../slide-toggle/slide-toggle.component'

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

  // Columns of articles simplemattable
  completedCol = new TableColumn<Article, 'completed'>('Completado', 'completed').isDirectEdit(true)

  columns = [
    new TableColumn<Article, 'id'>('ID Artículo', 'id')
      .withColFilter()
      .withWidth(Width.pct(20))
      .withNgStyle((id, article) => ({ color: article.decsCodes.length ? '#669966' : '' })),
    // .withNgComponent(ArticleComponent)
    // .withNgComponentInput((component: ArticleComponent, data, dataParent) => component.article = dataParent),
    new TableColumn<Article, 'title'>('Título', 'title')
      .withColFilter()
      .isTextHiddenXs(true),
    // .withWidth(Width.pct(80))
    // .withTransform(title => title.length > 30 ? title.slice(0, 30) + '...' : title),

    // new TableColumn<Article, 'completed'>('Completado', 'completed')
    //   .withColFilter()
    //   .withWidth(Width.pct(20))
    //   .withNgComponent(SlideToggleComponent)
    //   .withNgComponentInput((component: SlideToggleComponent, data, dataParent) => component.checked = dataParent.completed),

    this.completedCol
  ]

  constructor(
    private appService: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()
    this.completedCol.withFormField(this.completedCol.getCheckboxFormField())
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
