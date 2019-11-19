import { Component, OnInit } from '@angular/core'
import { Article, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'
import { TableColumn, Width } from 'simplemattable'

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  article: Article
  articles: Article[]

  // Columns for articles table
  columns = [
    new TableColumn<Article, 'id'>('Article ID', 'id').withColFilter(),
    new TableColumn<Article, 'title'>('Title', 'title').withColFilter().withNgClass(() => 'font-weight-bold'),
    new TableColumn<Article, 'abstract'>('Abstract', 'abstract').withColFilter(),
    new TableColumn<Article, 'decsCodes'>('DeCS Codes', 'decsCodes').withColFilter().withNgClass(() => 'text-monospace'),
  ]

  constructor(
    private appService: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()
  }

  getArticles() {
    const userToSend: User = {
      id: this.auth.getUserDetails().identity.id
    }
    this.appService.getArticles(userToSend).subscribe(articles => this.articles = articles)
  }

  selectArticle(article: Article) {
    this.article = article
  }

}
