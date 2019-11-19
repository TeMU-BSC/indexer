import { Component, OnInit } from '@angular/core'
import { Article, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'
import { TableColumn, Width, ButtonType } from 'simplemattable'

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

  // Columns for articles table
  columns = [
    new TableColumn<Article, 'id'>('Article ID', 'id').withColFilter()
      .withButton(ButtonType.BASIC)
      .withNgStyle((id, article) => ({ color: article.decsCodes.length ? '#669966' : '' })),
    new TableColumn<Article, 'title'>('Title', 'title').withColFilter()
      // .withTransform(title => title.length > 41 ? title.slice(0, 41) + '...' : title)
  ]

  constructor(
    private appService: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()
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
