import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, Descriptor, Annotator } from 'src/app/models/article.model'
import { Papa } from 'ngx-papaparse';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })

  constructor(
    private http: HttpClient,
    private papa: Papa
  ) { }

  /** 
   * Get one single article.
   */
  getArticle(): Observable<Article> {
    return this.http.get<Article>('http://localhost:4200/assets/data/article.json')
  }

  /**
   * Get a list of articles.
   */
  getArticles(): Observable<Article[]> {
    const data = 'http://localhost:4200/assets/data/articles.json'

    return this.http.get<Article[]>('http://localhost:4200/assets/data/articles-ankush.json')
    // return this.http.get<Article[]>('http://localhost:4200/assets/data/week9_test.json')

    // const url = 'http://84.88.188.74:5000/articles?start=0&total=1'
    // const url = 'http://localhost:5000/articles?start=0&total=1'
    // const options = { headers: this.headers }
    // return this.http.get<Article[]>(url, options)
  }

  getDescriptores() {
    const data = 'http://localhost:4200/assets/data/DeCS.2019.both.v5.tsv'
    // const data = 'http://localhost:4200/assets/data/test_parsing.tsv'

    this.papa.parse(data, {
      download: true,
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
      step: function(results, parser) {
        console.log("Row data:", results.data);
        console.log("Row errors:", results.errors);
      }
      // complete: results => console.log(results)
    });
    
  }

  /** 
   * Get one single annotator.
   */
  getAnnotator(): Observable<Annotator> {
    return this.http.get<Annotator>('http://localhost:4200/assets/data/annotator.json')
  }

  /**
   * Get a list of annotators.
   */
  getAnnotators(): Observable<Annotator[]> {
    return this.http.get<Annotator[]>('http://localhost:4200/assets/data/annotators.json')
    // const url = 'http://localhost:4200/assets/data/articles.json';
    // const options = { headers: this.headers };
    // return this.http.get<Article>(url, options);
  }

}
