import { Component, OnInit, ViewChild } from '@angular/core'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { Article, User } from 'src/app/app.model'
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material'
import { AppService } from 'src/app/services/app.service'
import { AuthenticationService } from 'src/app/services/auth.service'

@Component({
  selector: 'app-articles-table',
  templateUrl: './articles-table.component.html',
  styleUrls: ['./articles-table.component.css'],
  // animations: [
  //   trigger('detailExpand', [
  //     state('void', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
  //     state('*', style({ height: '*', visibility: 'visible' })),
  //     transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  //   ]),
  // ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ArticlesTableComponent implements OnInit {

  articles: Article[]
  displayedColumns: string[] = ['id', 'title']
  dataSource: MatTableDataSource<Article>

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator
  @ViewChild(MatSort, { static: false }) sort: MatSort

  isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow')

  constructor(
    private appService: AppService,
    private auth: AuthenticationService) { }

  ngOnInit() {
    this.getArticles()
    // this.dataSource = new MatTableDataSource<Article>(this.articles)
    // this.dataSource.paginator = this.paginator
    // this.dataSource.sort = this.sort
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim() // Remove whitespace
    filterValue = filterValue.toLowerCase() // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue
  }

  getArticles() {
    const currentUser: User = { id: this.auth.getUserDetails().identity.id }
    this.appService.getArticles(currentUser).subscribe(
      articles => this.articles = articles,
      error => console.warn(error),
      () => {
        this.dataSource = new MatTableDataSource<Article>(this.articles)
        this.dataSource.paginator = this.paginator
        this.dataSource.sort = this.sort
        console.log(this.articles)
      }
    )
  }

}
