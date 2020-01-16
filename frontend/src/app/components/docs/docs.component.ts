import { Component, OnInit } from '@angular/core'
import { Doc } from 'src/app/app.model'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { TableColumn, Width } from 'simplemattable'

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.css']
})
export class DocsComponent implements OnInit {

  docs: Doc[]
  doc: Doc
  columns = []

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    // Init the docs array
    this.api.getAssignedDocs({ user: this.auth.getCurrentUser().id, mode: this.api.revisionMode ? 'revision' : 'assignment' })
      .subscribe(docs => this.docs = docs)
    // Init the columns of the table
    this.columns = [
      new TableColumn<Doc, 'title'>('Título', 'title')
        .isHiddenXs(true)
        .withWidth(Width.pct(70))
        .withColFilter(),
      new TableColumn<Doc, 'id'>('ID documento', 'id')
        .withWidth(Width.pct(10))
        .withColFilter(),
      new TableColumn<Doc, 'decsCodes'>('Núm. descriptores', 'decsCodes')
        .isHiddenXs(true)
        .withWidth(Width.pct(10))
        .withColFilter()
        .withTransform(data => data.length.toString())
        .withSortTransform(data => Number(data.length.toString())),
      new TableColumn<Doc, 'completed'>('Estado', 'completed')
        .withWidth(Width.pct(10))
        .withColFilter()
        .withTransform(data => data ? 'Completado' : 'Pendiente')
        .withNgStyle(data => ({ color: data ? 'green' : 'red' }))
    ]
  }

  selectDoc(event: Doc) {
    this.doc = event
  }

}
