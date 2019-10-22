import { Component, OnInit } from '@angular/core'
import { MatSnackBar } from '@angular/material'
import { FormBuilder } from '@angular/forms'
import { Article } from 'src/app/models/article.model'
import { Annotator } from 'src/app/models/annotator.model'
import { ArticlesService } from '../services/articles.service'
import { AnnotatorsService } from '../services/annotators.service'


@Component({
  selector: 'app-indexer',
  templateUrl: './indexer.component.html',
  styleUrls: ['./indexer.component.css']
})
export class IndexerComponent implements OnInit {

  article: Article
  articles: Article[]
  annotator: Annotator

  constructor(
    private articlesService: ArticlesService,
    private annotatorsService: AnnotatorsService,
    private snackBar: MatSnackBar,
    // private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.getArticle()
    this.getArticles()
    this.getAnnotator()
  }

  getArticle() {
    this.articlesService.getArticle().subscribe(
      data => {
        this.article = data
      }
    )
  }

  getAnnotator() {
    this.annotatorsService.getAnnotator().subscribe(
      data => {
        this.annotator = data
      }
    )
  }

  getArticles() {
    this.articlesService.getArticles().subscribe(
      data => {
        this.articles = data
      }
    )
  }

  // toArray(value: string): void {
  //   this.article.decsCodes = value.split(/[\r\n]+/);
  // }

  saveDecs() {
    console.log(this.articles);
    console.log(this.annotator);
    // Inform the user that data has been saved
    this.snackBar.open('Data saved successfully.', 'OK', {
      duration: 4000
    })

  }

}
