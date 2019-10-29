import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { FormBuilder, FormControl } from '@angular/forms'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { Article, Descriptor, Annotator } from 'src/app/models/article.model'
import { ArticlesService } from 'src/app/services/articles.service'
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

  descriptores: Descriptor[] = []
  filteredDescriptores: Observable<Descriptor[]>;

  // // ----------------------------------------------------
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  // // ----------------------------------------------------
  // items: string[] = ["Noah", "Liam", "Mason", "Jacob"]
  // formControlValue = '';
  // findChoices(searchText: string) {
  //   return ['John', 'Jane', 'Jonny'].filter(item =>
  //     item.toLowerCase().includes(searchText.toLowerCase())
  //   );
  // }
  // getChoiceLabel(choice: string) {
  //   return `@${choice} `;
  // }
  // ----------------------------------------------------
  // keyword = 'name';
  keyword = 'descriptionEs';
  data = [
    {
      id: 1,
      name: 'Usa'
    },
    {
      id: 2,
      name: 'England'
    }
  ];


  selectEvent(item) {
    // do something with selected item
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e) {
    // do something when input is focused
  }
  // ----------------------------------------------------



  constructor(
    private articlesService: ArticlesService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.getArticles()
    this.getAnnotators()
    this.getDescriptores()
  }

  getArticles() {
    this.articlesService.getArticles().subscribe(
      data => {this.articles = data, console.log(this.articles);},
      
      error => console.log(error),
      () => this.article = this.articles[1]
    )
  }

  getAnnotators() {
    this.articlesService.getAnnotators().subscribe(
      data => this.annotators = data,
      error => console.log(error),
      () => this.annotator = this.annotators[1]
    )
  }

  getDescriptores() {
    this.articlesService.getDescriptores().subscribe(
      data => this.descriptores = data,
      error => console.log(error),
      () => {
        this.filteredOptions = this.myControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );

        // this.filteredDescriptores = this.myControl.valueChanges.pipe(
        //   startWith(''),
        //   map(value => typeof value === 'string' ? value : value.descriptionEs),
        //   map(descriptionEs => descriptionEs ? this._filterDescriptionEs(descriptionEs) : this.descriptores.slice())
        // );

        this.filteredDescriptores = this.myControl.valueChanges
          .pipe(
            startWith(''),
            map(descriptor => this._filterDescriptor(descriptor))
          )

        // this.filteredDescriptores = this.myControl.valueChanges
        //   .pipe(
        //     startWith(''),
        //     // map(value => this._filter(value)),

        //     // map(value => typeof value === 'string' ? value : value.code),
        //     // map(code => code ? this._filterCode(code) : this.descriptores.slice()),

        //     map(value => typeof value.id === 'string' ? value.id : value.description.es),
        //     map(descriptionEs => descriptionEs ? this._filterDescriptionEs(descriptionEs) : this.descriptores.slice()),
        //   );
      }
    )
  }

  private _filter(value: string): string[] {
    return this.options.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) === 0)
  }

  private _filterDescriptionEs(descriptionEs: string): Descriptor[] {
    return this.descriptores.filter(descriptores => descriptores.descriptionEs.toLowerCase().indexOf(descriptionEs.toLowerCase()) === 0)
  }

  private _filterDescriptor(value: Descriptor): Descriptor[] {
    console.log(value);
    
    return this.descriptores.filter(
      // option => {
      //   option.id.toLowerCase().includes(value.id.toLowerCase())
      //     || option.descriptionEs.toLowerCase().includes(value.descriptionEs.toLowerCase())
      // }
      option => option.id.toLowerCase().includes(value.id.toLowerCase())
    )
  }


  // private _filterSynonymEn(synonymsEn: string): Descriptor[] {
  //   return this.descriptores.filter(descriptores => descriptores.synonyms.en.toLowerCase().indexOf(synonymsEn.toLowerCase()) === 0)
  // }
  // private _filterSynonymEs(synonymsEs: string): Descriptor[] {
  //   return this.descriptores.filter(descriptores => descriptores.synonyms.es.toLowerCase().indexOf(synonymsEs.toLowerCase()) === 0)
  // }
  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();
  //   return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  // }



  toArray(): void {
    // const currentDescriptores = this.article.descriptoresString.split(/[\s\.\-,;:]+/)
    // console.log(currentDescriptores);

    // this.article.descriptores.forEach(id => {

    // });
  }

  saveDecs() {
    console.log(this.annotator)
    // console.log(this.articles)
    console.log(this.article);
    console.log(this.descriptores);

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

  onSelectionChange(event) {
    let descriptor: Descriptor = {
      id: event.option.value.id,
      // timestamp: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en')
      addedOn: new Date().getTime().toString()
    }
    this.article.descriptores.push(descriptor)

  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

}
