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
        .withColFilter().withColFilterLabel('Filtrar'),
      new TableColumn<Doc, 'title'>('Título', 'title')
        .isHiddenXs(true)
        .withWidth(Width.pct(75))
        .withColFilter().withColFilterLabel('Filtrar'),
      new TableColumn<Doc, 'completed'>('Completado', 'completed')
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(completed => completed ? 'Sí' : 'No')
        .withNgStyle(completed => ({ color: completed ? 'green' : 'red' })),
      new TableColumn<Doc, 'decsCodes'>('DeCS iniciales', 'decsCodes')
        .isHiddenXs(true)
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(decsCodes => decsCodes.length.toString())
        .withSortTransform(decsCodes => Number(decsCodes.length.toString())),
      new TableColumn<Doc, 'validated'>('Validado', 'validated')
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(validated => validated ? 'Sí' : 'No')
        .withNgStyle(validated => ({ color: validated ? 'green' : 'red' })),
      new TableColumn<Doc, 'validatedDecsCodes'>('DeCS validados', 'validatedDecsCodes')
        .isHiddenXs(true)
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(validatedDecsCodes => validatedDecsCodes.length.toString())
        .withSortTransform(validatedDecsCodes => Number(validatedDecsCodes.length.toString())),
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
