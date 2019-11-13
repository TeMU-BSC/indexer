import { Component, OnInit } from '@angular/core'
import { Article } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  article: Article
  articles: Article[]

  constructor(private appService: AppService) { }

  ngOnInit() {
    this.getArticles()
  }

  getArticles() {
    this.appService.getArticles(10).subscribe(articles => this.articles = articles)
  }

  selectArticle(article: Article) {
    this.article = article
  }

}
