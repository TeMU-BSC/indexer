import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from 'src/app/models/article.model'
import { Decs } from 'src/app/models/decs.model'

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })

  constructor(private http: HttpClient) { }

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
    return this.http.get<Article[]>('http://localhost:4200/assets/data/articles.json')
    // const url = 'http://localhost:4200/assets/data/articles.json';
    // const options = { headers: this.headers };
    // return this.http.get<Article>(url, options);
  }

  getDecs(): Observable<Decs[]> {
    return this.http.get<Decs[]>('http://localhost:4200/assets/data/decs.json')
  }

}
