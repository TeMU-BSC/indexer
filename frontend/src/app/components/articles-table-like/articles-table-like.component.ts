import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core'
import { map } from 'rxjs/operators'
import { MatSort, Sort } from '@angular/material'
import { MatPaginator, PageEvent } from '@angular/material'
import { fromMatSort, sortRows } from './datasource-utils'
import { fromMatPaginator, paginateRows } from './datasource-utils'
import { Article, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { Observable, of } from 'rxjs'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-articles-table-like',
  templateUrl: './articles-table-like.component.html',
  // styleUrls: ['./articles-table-like.component.css']
  styleUrls: ['./articles-table-like.component.scss']
})
export class ArticlesTableLikeComponent implements OnInit {

  @ViewChild(MatSort, { static: false }) sort: MatSort
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator

  displayedRows$: Observable<Article[]>
  totalRows$: Observable<number>

  article: Article
  articles: Article[]

  constructor(private appService: AppService, private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()

    const sortEvents$: Observable<Sort> = fromMatSort(this.sort)
    const pageEvents$: Observable<PageEvent> = fromMatPaginator(this.paginator)

    const rows$ = of(this.articles)

    this.totalRows$ = rows$.pipe(map(rows => rows ? rows.length : null))
    this.displayedRows$ = rows$.pipe(sortRows(sortEvents$), paginateRows(pageEvents$))
  }

  getArticles() {
    const userToSend: User = { id: this.auth.getUserDetails().identity.id }
    this.appService.getArticles(userToSend).subscribe(articles => {
      this.articles = articles
      // this.currentArticles = this.articles.slice(0, 10)
      console.log(this.articles)
    })
  }

}
