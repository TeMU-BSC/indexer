import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { FormBuilder, FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Article } from 'src/app/models/article.model'
import { Annotator } from 'src/app/models/annotator.model'
import { ArticlesService } from 'src/app/services/articles.service'
import { AnnotatorsService } from 'src/app/services/annotators.service'
import { Decs } from 'src/app/models/decs.model'
import { formatDate } from '@angular/common'


export interface User {
  name: string
  surname: string
}

@Component({
  selector: 'app-indexer',
  templateUrl: './indexer.component.html',
  styleUrls: ['./indexer.component.css']
})
export class IndexerComponent implements OnInit {

  article: Article = {}
  articles: Article[] = []
  annotator: Annotator = {}
  annotators: Annotator[] = []
  myControl = new FormControl();

  decs: Decs[] = []
  filteredDecs: Observable<Decs[]>;

  options: User[] = [
    { name: 'Mary', surname: 'blah' },
    { name: 'Shelley', surname: 'bleh' },
    { name: 'Igor', surname: 'bluh' }
  ];
  filteredOptions: Observable<User[]>;


  constructor(
    private articlesService: ArticlesService,
    private annotatorsService: AnnotatorsService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.getArticle()
    // this.getArticles()
    this.getAnnotators()
    this.getDecs()
  }

  getArticle() {
    this.articlesService.getArticle().subscribe(
      data => this.article = data
    )
  }

  getArticles() {
    this.articlesService.getArticles().subscribe(
      data => this.articles = data
    )
  }

  getAnnotators() {
    this.annotatorsService.getAnnotators().subscribe(
      data => {
        this.annotators = data
      }
    )
  }

  displayFn(dec?: Decs): string | undefined {
    return dec ? dec.code : undefined;
  }

  private _filterCode(code: string): Decs[] {
    return this.decs.filter(decs => decs.code.toLowerCase().indexOf(code.toLowerCase()) === 0)
  }
  private _filterDescriptionEn(descriptionEn: string): Decs[] {
    return this.decs.filter(decs => decs.description.en.toLowerCase().indexOf(descriptionEn.toLowerCase()) === 0)
  }
  private _filterDescriptionEs(descriptionEs: string): Decs[] {
    return this.decs.filter(decs => decs.description.es.toLowerCase().indexOf(descriptionEs.toLowerCase()) === 0)
  }
  private _filterSynonymEn(synonymsEn: string): Decs[] {
    return this.decs.filter(decs => decs.synonyms.en.toLowerCase().indexOf(synonymsEn.toLowerCase()) === 0)
  }
  private _filterSynonymEs(synonymsEs: string): Decs[] {
    return this.decs.filter(decs => decs.synonyms.es.toLowerCase().indexOf(synonymsEs.toLowerCase()) === 0)
  }

  getDecs() {
    this.articlesService.getDecs().subscribe(
      data => this.decs = data,
      error => { },
      () => {
        this.filteredDecs = this.myControl.valueChanges
          .pipe(
            startWith(''),
            // map(value => typeof value === 'string' ? value : value.code),
            // map(code => code ? this._filterCode(code) : this.decs.slice()),

            map(value => typeof value === 'string' ? value : value.description.es),
            map(descriptionEs => descriptionEs ? this._filterDescriptionEs(descriptionEs) : this.decs.slice()),
          );
      }
    )
  }

  toArray(value: string): void {
    this.article.decsCodes = value.split(/[\s\.\-,;:]+/)
  }

  saveDecs() {
    let msg: string
    console.log(this.annotator)
    console.log(JSON.stringify(this.article.decsCodes))
    console.log(formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en'))



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

}
