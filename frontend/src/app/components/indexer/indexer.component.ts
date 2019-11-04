import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Annotator, Article, Descriptor } from '../../app.model'
import { AppService } from '../../app.service'
import { formatDate } from '@angular/common'

// TODO enviar al backend fechas antiguas de descriptors que el annotador no modifica
// TODO implementar login contra bbdd

@Component({
  selector: 'app-indexer',
  templateUrl: './indexer.component.html',
  styleUrls: ['./indexer.component.css']
})
export class IndexerComponent implements OnInit {

  user: Annotator
  annotators: Annotator[] = []
  article: Article = {}
  articles: Article[] = []
  allDescriptors: Descriptor[] = []
  decsForm: FormGroup

  myControl = new FormControl()
  filteredDescriptors: Observable<Descriptor[]>

  descriptorsString = ''
  descriptorsSimpleArray: string[]
  articleUpdatedDescriptors: Descriptor[] = []

  orderForm: FormGroup
  items: FormArray

  constructor(
    private appService: AppService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.initForm()
    this.getArticles()
    this.getAnnotators()
    this.getDescriptors()
  }

  initForm() {
    /* Initiate the form structure */
    this.decsForm = this.formBuilder.group({
      // annotator: [, Validators.required],
      descriptors: this.formBuilder.array(
        [this.formBuilder.group({ decsCode: ['', Validators.required], addedOn: this.getAddedOn() })],
        Validators.required
      )
    })
  }

  get descriptors() {
    return this.decsForm.get('descriptors') as FormArray
  }
  addDescriptor() {
    this.descriptors.push(this.formBuilder.group({ decsCode: ['', Validators.required], addedOn: this.getAddedOn() }))
  }
  removeDescriptor(index: number) {
    this.descriptors.removeAt(index)
  }

  getAddedOn() {
    return formatDate(new Date().getTime(), 'yyyy-MM-ddTHH:mm:ss', 'en')
  }

  getAnnotators() {
    this.appService.getAnnotators().subscribe(
      data => this.annotators = data
    )
  }

  getArticles() {
    this.appService.getArticles(3).subscribe(
      response => this.articles = response['results'],
      error => console.log(error),
      () => {
        // TODO select article by annotator in view
        this.article = this.articles[1]
        console.log(this.articles);
        

        if (this.article.descriptors === undefined) {
          this.article.descriptors = []
        }
        // this.article.descriptors.forEach(descriptor => {
        //   this.descriptorsString += `${descriptor.id}\n`
        // })
      }
    )
  }

  // WORK OK WITH HTTP GET ON APP SERVICE AND SUBSCRIBE HERE
  // getDescriptors() {
  //   this.appService.getDescriptors().subscribe(
  //     data => this.allDescriptors = data,
  //     error => console.log(error),
  //     () => {
  //       this.filteredDescriptors = this.myControl.valueChanges.pipe(
  //         startWith(''),
  //         map(value => typeof value === 'string' ? value : value.termSpanish),
  //         map(termSpanish => termSpanish ? this._filterDescriptors(termSpanish) : this.allDescriptors.slice())
  //       )
  //     }
  //   )
  // }

  getDescriptors() {
    this.allDescriptors = this.appService.getDescriptors()

    // Init filtered descriptors list
    this.filteredDescriptors = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.termSpanish),
      map(termSpanish => termSpanish ? this._filterDescriptors(termSpanish) : this.allDescriptors.slice())
    )
  }

  // Filtering
  private _filterDescriptors(termSpanish: string): Descriptor[] {
    const filterValue = termSpanish.toLowerCase()
    return this.allDescriptors.filter(option => option.termSpanish.toLowerCase().includes(filterValue))
  }

  displayFn(descriptor?: Descriptor): string | undefined {
    return descriptor ? descriptor.id : undefined
  }

  toArray() {
    this.descriptorsSimpleArray = this.descriptorsString.split(/[\s\.\-,;:]+/)
  }

  onSelectionChange(event) {
    this.descriptorsString += `\n${event.option.value.id}`
    this.articleUpdatedDescriptors.push({
      id: event.option.value.id,
      addedOn: formatDate(new Date().getTime(), 'yyyy-MM-ddTHH:mm:ss', 'en')
    })
  }

  saveDecs() {
    // let message: string
    if (this.user === undefined) {
      // message = 'Please, select an annotator.'
      this.snackBar.open('Please, select an annotator.', 'OK', {
        duration: 5000
      })
      return
    }

    // Get data from the form
    this.article.addedBy = this.user.id
    this.article.descriptors = this.decsForm.controls.descriptors.value

    // Send request to backend
    this.appService.updateArticle(this.article).subscribe(bu => console.log(bu))
    this.snackBar.open('DeCS saved successfully.', 'OK', {
      duration: 5000
    })


  }

  trackByFn(index, item) {
    return item.id // unique id corresponding to the item
  }

}
