import { AfterViewInit, Component } from '@angular/core'
import { TableColumn, Width } from 'simplemattable'
import { Doc } from 'src/app/models/decs'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { PageEvent } from '@angular/material/paginator'


@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements AfterViewInit {

  columns = []
  data: Doc[]
  selectedDoc: Doc
  loading: boolean
  paginatorLength: number

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
        .withSortTransform((_, doc) => doc.decsCodes.length),
      new TableColumn<Doc, 'validated'>('Validado', 'validated')
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(validated => validated ? 'Sí' : 'No')
        .withNgStyle(validated => ({ color: validated ? 'green' : 'red' })),
      new TableColumn<Doc, 'validatedDecsCodes'>('DeCS validados', 'validatedDecsCodes')
        .isHiddenXs(true)
        .withColFilter().withColFilterLabel('Filtrar')
        .withTransform(validatedDecsCodes => validatedDecsCodes.length.toString())
        .withSortTransform((_, doc) => doc.validatedDecsCodes.length),
    ]

    // version 2: without decsCodes counts per document and phase (completed, validated)
    // this.columns = [
    //   new TableColumn<Doc, 'id'>('ID documento', 'id')
    //     .withColFilter().withColFilterLabel('Filtrar'),
    //   new TableColumn<Doc, 'title'>('Título', 'title')
    //     .isHiddenXs(true)
    //     .withWidth(Width.pct(75))
    //     .withColFilter().withColFilterLabel('Filtrar'),
    //   new TableColumn<Doc, 'completed'>('Completado (núm. de DeCS)', 'completed')
    //     .withColFilter().withColFilterLabel('Filtrar')
    //     .withTransform((completed, doc) => completed ? `Sí (${doc.decsCodes.length})` : `No (${doc.decsCodes.length})`)
    //     .withSortTransform((_, doc) => doc.decsCodes.length)
    //     .withNgStyle(completed => ({ color: completed ? 'green' : 'red' })),
    //   new TableColumn<Doc, 'validated'>('Validado (núm. de DeCS)', 'validated')
    //     .withColFilter().withColFilterLabel('Filtrar')
    //     .withTransform((validated, doc) => validated ? `Sí (${doc.validatedDecsCodes.length})` : `No (${doc.validatedDecsCodes.length})`)
    //     .withSortTransform((_, doc) => doc.validatedDecsCodes.length)
    //     .withNgStyle(validated => ({ color: validated ? 'green' : 'red' })),
    // ]
  }

  ngAfterViewInit() {
    this.refresh()
  }

  refresh(event?: PageEvent) {
    this.loading = true
    const assignment = {
      user: this.auth.getCurrentUser().id,
      pageIndex: event?.pageIndex,
      pageSize: event?.pageSize,
    }
    this.api.getAssignedDocs(assignment).subscribe(
      next => {
        this.data = next.items
        this.paginatorLength = next.total
      },
      error => console.error(error),
      () => this.loading = false
    )
  }

  selectDoc(row: Doc) {
    this.selectedDoc = row
  }

}
