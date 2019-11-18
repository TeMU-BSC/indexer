import { Component, OnInit } from '@angular/core'
import { Article, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  article: Article
  articles: Article[]

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
