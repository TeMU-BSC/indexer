import { Component, AfterViewInit, ViewChild } from '@angular/core'
import { Doc } from 'src/app/models/decs'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { TableColumn, Width } from 'simplemattable'


@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements AfterViewInit {

  columns = []
  data: Doc[]
  @ViewChild('doc') selectedDoc: Doc
  loading = true

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {
    // Init the columns of the table
    this.columns = [
      new TableColumn<Doc, 'id'>('ID documento', 'id')
        .withWidth(Width.pct(10))
        .withColFilter().withColFilterLabel('Filtrar'),
      new TableColumn<Doc, 'title'>('Título', 'title')
        .isHiddenXs(true)
        .withWidth(Width.pct(80))
        .withColFilter().withColFilterLabel('Filtrar'),
      new TableColumn<Doc, 'decsCodes'>('Núm. descriptores', 'decsCodes')
        .withWidth(Width.pct(10))
        .isHiddenXs(true)
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(data => data.length.toString())
        .withSortTransform(data => Number(data.length.toString())),
      new TableColumn<Doc, 'completed'>('Completado', 'completed')
        .withWidth(Width.pct(5))
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(data => data ? 'Sí' : 'No')
        .withNgStyle(data => ({ color: data ? 'green' : 'red' })),
      new TableColumn<Doc, 'validated'>('Validado', 'validated')
        .withWidth(Width.pct(5))
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(data => data ? 'Sí' : 'No')
        .withNgStyle(data => ({ color: data ? 'green' : 'red' }))
    ]
  }

  ngAfterViewInit() {
    // Init the docs array
    this.api.getAssignedDocs({
      user: this.auth.getCurrentUser().id
    }).subscribe(next => {
      this.data = next
      this.loading = false
    })
  }

  selectDoc(event: Doc) {
    this.selectedDoc = event
  }

}
