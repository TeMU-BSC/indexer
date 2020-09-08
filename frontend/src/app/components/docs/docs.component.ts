import { AfterViewInit, Component } from '@angular/core'
import { PageEvent } from '@angular/material/paginator'
import { TableColumn, Width } from 'simplemattable'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { Doc } from 'src/app/models/decs'
import { Assignment } from 'src/app/models/assignment'


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
  }

  ngAfterViewInit() {
    this.refresh()
  }

  refresh(event?: PageEvent) {
    this.loading = true
    const assignment: Assignment = {
      userId: this.auth.getCurrentUser().id,
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
