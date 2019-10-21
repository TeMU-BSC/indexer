import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from 'src/app/models/article.model'

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
    return this.http.get<Article>('http://localhost:4200/assets/article.json')
  }

  // /**
  //  * Get one single article.
  //  */
  // getArticles(): Observable<Article> {
  //   const url = `http://bsccnio01.bsc.es:5000/mesinesp/api/article`;
  //   const options = { headers: this.headers };
  //   return this.http.get<Article>(url, options);
  // }

}
