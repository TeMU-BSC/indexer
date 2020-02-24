import { Component, AfterViewInit, Output, EventEmitter } from '@angular/core'
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
  docs: Doc[]
  selectedDoc: Doc
  loading = true

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {
    // init the columns of the table
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
        .withTransform(decsCodes => decsCodes.length.toString())
        .withSortTransform(decsCodes => Number(decsCodes.length.toString())),
      new TableColumn<Doc, 'completed'>('Completado', 'completed')
        .withWidth(Width.pct(5))
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(completed => completed ? 'Sí' : 'No')
        .withNgStyle(completed => ({ color: completed ? 'green' : 'red' })),
      new TableColumn<Doc, 'validated'>('Validado', 'validated')
        .withWidth(Width.pct(5))
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(validated => validated ? 'Sí' : 'No')
        .withNgStyle(validated => ({ color: validated ? 'green' : 'red' }))
    ]
  }

  ngAfterViewInit() {
    this.refresh()
  }

  refresh() {
    this.api.getAssignedDocs({ user: this.auth.getCurrentUser().id }).subscribe(
      next => this.docs = next,
      error => console.error(error),
      () => this.loading = false
    )
  }

  selectDoc(row: Doc) {
    this.selectedDoc = row
  }

}
