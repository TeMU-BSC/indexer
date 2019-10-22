import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Annotator } from 'src/app/models/annotator.model'

@Injectable({
  providedIn: 'root'
})
export class AnnotatorsService {

  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })

  constructor(private http: HttpClient) { }

  /** 
   * Get one single annotator.
   */
  getAnnotator(): Observable<Annotator> {
    return this.http.get<Annotator>('http://localhost:4200/assets/data/annotator.json')
  }

  /**
   * Get a list of annotators.
   */
  getArticles(): Observable<Annotator[]> {
    return this.http.get<Annotator[]>('http://localhost:4200/assets/data/annotators.json')
    // const url = 'http://localhost:4200/assets/data/articles.json';
    // const options = { headers: this.headers };
    // return this.http.get<Article>(url, options);
  }

}
