import { Component, OnInit } from '@angular/core'
import { Doc, User } from 'src/app/app.model'
import { AppService } from 'src/app/services/app.service'
import { AuthService } from 'src/app/services/auth.service'
import { TableColumn, Width } from 'simplemattable'
// import { SlideToggleComponent } from '../slide-toggle/slide-toggle.component'
// import { AbstractControl } from '@angular/forms'

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.css']
})
export class DocsComponent implements OnInit {

  doc: Doc
  docs: Doc[]
  currentDocs: Doc[]
  color: string
  columns = []

  constructor(
    private appService: AppService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.getAssignedDocs()
    }

    // const completedCol = new TableColumn<Doc, 'completed'>('Completado', 'completed')
    // completedCol.withFormField(completedCol.getCheckboxFormField())

    this.columns = [
      new TableColumn<Doc, 'title'>('Título', 'title')
        .isHiddenXs(true)
        .withWidth(Width.pct(70))
        .withColFilter(),
      // .isTextHiddenXs(true)
      // .withTransform(title => title.length > 30 ? title.slice(0, 30) + '...' : title)
      new TableColumn<Doc, 'id'>('ID documento', 'id')
        .withWidth(Width.pct(10))
        .withColFilter(),
      // .withNgStyle((id, doc) => ({ color: doc.decsCodes.length ? '#669966' : '' }))
      // .withNgComponent(DocComponent)
      // .withNgComponentInput((component: DocComponent, data, dataParent) => component.doc = dataParent)
      new TableColumn<Doc, 'decsCodes'>('Núm. descriptores', 'decsCodes')
        .isHiddenXs(true)
        .withWidth(Width.pct(10))
        .withColFilter()
        .withTransform(data => data.length.toString())
        .withSortTransform(data => Number(data.length.toString())),
      // new TableColumn<Doc, 'completed'>('Completado', 'completed')
      //   .withColFilter()
      //   .withNgComponent(SlideToggleComponent)
      //   .withNgComponentInput((component: SlideToggleComponent, data, dataParent) => component.checked = dataParent.completed)
      // completedCol
      //   .withWidth(Width.pct(10))
      //   .isDirectEdit(true)
      //   .withColFilter()
      new TableColumn<Doc, 'completed'>('Completado', 'completed')
        .withWidth(Width.pct(10))
        .withColFilter()
        .withTransform(data => data ? 'Completado' : 'Pendiente')
        .withNgStyle(data => ({ color: data ? 'green' : 'red' }))
    ]
  }

  getAssignedDocs() {
    const userToSend: User = {
      id: this.auth.getCurrentUser().id
    }
    this.appService.getAssignedDocs(userToSend).subscribe(docs => {
      this.docs = docs
      // this.currentDocs = this.docs.slice(0, 10)
    })
  }

  selectDoc(doc: Doc) {
    this.doc = doc
  }

  // onPageChange($event) {
  //   this.currentDocs = this.docs.slice(
  //     $event.pageIndex * $event.pageSize,
  //     $event.pageIndex * $event.pageSize + $event.pageSize
  //   )
  // }

  // setColor(doc: Doc): string {
  //   return doc.decsCodes.length ? '' : 'primary'
  // }

}
