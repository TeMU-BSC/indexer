import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { FormBuilder } from '@angular/forms'
import { Article } from 'src/app/models/article.model'
import { ArticlesService } from '../services/articles.service'


@Component({
  selector: 'app-indexer',
  templateUrl: './indexer.component.html',
  styleUrls: ['./indexer.component.css']
})
export class IndexerComponent implements OnInit {

  article: Article

  constructor(
    private articlesService: ArticlesService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.getArticle()
  }

  getArticle() {
    this.articlesService.getArticle().subscribe(
      data => {
        this.article = data
      }
    )
  }

  toArray(value: string): void {
    this.article.decsCodes = value.split(/[\r\n]+/);
  }

  saveDecs() {
    console.log(this.article.decsCodes);
    // Inform the user that data has been saved
    this.snackBar.open('Data saved successfully.', 'OK', {
      duration: 4000
    })

  }

}
