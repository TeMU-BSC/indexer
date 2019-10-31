import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { FormBuilder, FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Annotator } from '../models/annotator.model'
import { Descriptor } from '../models/descriptor.model'
import { Article } from 'src/app/models/article.model'
import { ArticlesService } from 'src/app/services/articles.service'
import { formatDate } from '@angular/common'


// TODO enviar al backend fechas antiguas de descriptors que el annotador no modifica

export interface User {
  name: string
  phone: string
}

@Component({
  selector: 'app-indexer',
  templateUrl: './indexer.component.html',
  styleUrls: ['./indexer.component.css']
})
export class IndexerComponent implements OnInit {

  annotator: Annotator = {}
  annotators: Annotator[] = []
  article: Article = {}
  articles: Article[] = []
  descriptors: Descriptor[] = []
  myControl = new FormControl()
  filteredDescriptors: Observable<Descriptor[]>
  
  descriptorsString: string = ''
  descriptorsSimpleArray: string[]
  articleUpdatedDescriptors: Descriptor[] = []

  constructor(
    private articlesService: ArticlesService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getArticles()
    this.getAnnotators()
    this.getDescriptors()
  }

  getArticles() {
    this.articlesService.getArticles().subscribe(
      data => this.articles = data['results'],
      error => console.log(error),
      () => {
        this.article = this.articles[1]
        this.descriptorsString = this.article.descriptors ? this.article.descriptors.toString() : ''
      }
    )
  }

  getAnnotators() {
    this.articlesService.getAnnotators().subscribe(
      data => this.annotators = data,
      error => console.log(error),
      () => this.annotator = this.annotators[1]
    )
  }

  getDescriptors() {
    this.articlesService.getDescriptors().subscribe(
      data => this.descriptors = data,
      error => console.log(error),
      () => {
        this.filteredDescriptors = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.termSpanish),
          map(termSpanish => termSpanish ? this._filterDescriptors(termSpanish) : this.descriptors.slice())
        );
      }
    )
  }

  // Filtering
  private _filterDescriptors(termSpanish: string): Descriptor[] {
    const filterValue = termSpanish.toLowerCase()
    return this.descriptors.filter(option => option.termSpanish.toLowerCase().includes(filterValue))
  }

  displayFn(descriptor?: Descriptor): string | undefined {
    return descriptor ? descriptor.decsCode : undefined
  }

  toArray() {
    this.descriptorsSimpleArray = this.descriptorsString.split(/[\s\.\-,;:]+/)
  }

  onSelectionChange(event) {
    this.descriptorsString += `,${event.option.value.decsCode}`
    this.articleUpdatedDescriptors.push({
      decsCode: event.option.value.decsCode,
      addedOn: formatDate(new Date().getTime(), 'yyyy-MM-ddTHH:mm:ss', 'en')
    })
  }

  saveDecs() {
    this.article.addedBy = this.annotator.id
    this.article.descriptors = this.articleUpdatedDescriptors
    this.descriptorsSimpleArray.forEach(decsCode => {
      this.article.descriptors.push({
        decsCode: decsCode,
        addedOn: formatDate(new Date().getTime(), 'yyyy-MM-ddTHH:mm:ss', 'en')
      })
    });

    console.log(this.article)

    let msg: string
    if (this.annotator.id === undefined) {
      msg = 'Please, select an annotator.'
      // let duration = 
    } else {
      msg = 'DeCS saved successfully.'
    }
    this.snackBar.open(msg, 'OK', {
      duration: 5000
    })


  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }


}
