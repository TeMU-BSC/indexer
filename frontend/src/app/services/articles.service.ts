import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Annotator } from '../models/annotator.model'
import { Descriptor } from '../models/descriptor.model'
import { Article } from 'src/app/models/article.model'

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })

  constructor(
    private http: HttpClient
  ) { }

  /** 
   * Get one single article.
   */
  getArticle(): Observable<Article> {
    return this.http.get<Article>('assets/data/article.json')
  }

  /**
   * Get a list of articles.
   */
  getArticles(): Observable<Article[]> {
    const data = 'assets/data/articles.json'

    return this.http.get<Article[]>('assets/data/articles-ankush.json')
    // return this.http.get<Article[]>('assets/data/week9_test.json')

    // const url = 'http://84.88.188.74:5000/articles?start=0&total=1'
    // const url = 'http://localhost:5000/articles?start=0&total=1'
    // const options = { headers: this.headers }
    // return this.http.get<Article[]>(url, options)
  }

  getDescriptors(): Observable<Descriptor[]> {
    // return this.http.get<Descriptor[]>('assets/data/DeCS.2019.both.v5.json')
    return this.http.get<Descriptor[]>('assets/data/DeCS.2019.both.v5_limited.json')

    // this.papa.parse('assets/data/DeCS.2019.both.v5.tsv', {
    //   download: true,
    //   header: true,
    //   delimiter: '\t',
    //   skipEmptyLines: true,
    //   quoteChar: '',
    //   complete: results => console.log(results)
    // })
  }

  /** 
   * Get one single annotator.
   */
  getAnnotator(): Observable<Annotator> {
    return this.http.get<Annotator>('assets/data/annotator.json')
  }

  /**
   * Get a list of annotators.
   */
  getAnnotators(): Observable<Annotator[]> {
    return this.http.get<Annotator[]>('assets/data/annotators.json')
    // const url = 'assets/data/articles.json';
    // const options = { headers: this.headers };
    // return this.http.get<Article>(url, options);
  }

}
