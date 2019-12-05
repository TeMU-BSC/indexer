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
  columns = []

  constructor(
    private appService: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()

    const completedCol = new TableColumn<Article, 'completed'>('Completado', 'completed')
    completedCol.withFormField(completedCol.getCheckboxFormField())

    this.columns = [
      new TableColumn<Article, 'title'>('Título', 'title')
        .withWidth(Width.pct(70))
        .withColFilter()
        .isHiddenXs(true),
      // .isTextHiddenXs(true),
      // .withTransform(title => title.length > 30 ? title.slice(0, 30) + '...' : title),
      new TableColumn<Article, 'id'>('ID Artículo', 'id')
        .withWidth(Width.pct(10))
        .withColFilter(),
      // .withNgStyle((id, article) => ({ color: article.decsCodes.length ? '#669966' : '' })),
      // .withNgComponent(ArticleComponent)
      // .withNgComponentInput((component: ArticleComponent, data, dataParent) => component.article = dataParent),
      new TableColumn<Article, 'decsCodes'>('Núm. descriptores', 'decsCodes')
        .withWidth(Width.pct(10))
        .withColFilter()
        .withTransform(data => data.length.toString()),
      // new TableColumn<Article, 'completed'>('Completado', 'completed')
      //   .withColFilter()
      //   .withNgComponent(SlideToggleComponent)
      //   .withNgComponentInput((component: SlideToggleComponent, data, dataParent) => component.checked = dataParent.completed),
      // completedCol
      //   .withWidth(Width.pct(10))
      //   .isDirectEdit(true)
      //   .withColFilter()
      new TableColumn<Article, 'completed'>('Completado', 'completed')
        .withWidth(Width.pct(10))
        .withColFilter()
        .withTransform(data => data.toString()),
    ]
  }

  getArticles() {
    const userToSend: User = { id: this.auth.getUserDetails().identity.id }
    this.appService.getArticles(userToSend).subscribe(articles => {
      this.articles = articles
      this.currentArticles = this.articles.slice(0, 10)
    })
  }

  selectArticle(article: Article) {
    this.article = article
  }

  // onPageChange($event) {
  //   this.currentArticles = this.articles.slice(
  //     $event.pageIndex * $event.pageSize,
  //     $event.pageIndex * $event.pageSize + $event.pageSize
  //   )
  // }

  // setColor(article: Article): string {
  //   return article.decsCodes.length ? '' : 'primary'
  // }

}
