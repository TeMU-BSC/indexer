import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Annotator, Article, Descriptor } from './app.model'
import * as ALL_DESCRIPTORS from '../assets/data/DeCS.2019.both.v5_limited.json'


@Injectable({
  providedIn: 'root'
})
export class AppService {

  decs: Descriptor[] = (ALL_DESCRIPTORS as any).default
  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })
  options: any = { headers: this.headers }

  constructor(
    private http: HttpClient
  ) { }

  getAnnotators(): Observable<Annotator[]> {
    return this.http.get<Annotator[]>('assets/data/dummy_annotators.json')
    // const url = 'assets/data/articles.json'
    // const options = { headers: this.headers }
    // return this.http.get<Article>(url, options)
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>('assets/data/articles-ankush.json')

    // const url = 'http://84.88.188.74:5000/articles?start=0&total=1'
    // const url = 'http://localhost:5000/articles?start=0&total=1'
    // const options = { headers: this.headers }
    // return this.http.get<Article[]>(url, options)
  }

  // getDescriptors(): Observable<Descriptor[]> {
  //   // return this.http.get<Descriptor[]>('assets/data/DeCS.2019.both.v5.json')
  //   return this.http.get<Descriptor[]>('assets/data/DeCS.2019.both.v5_limited.json')

  //   // this.papa.parse('assets/data/DeCS.2019.both.v5.tsv', {
  //   //   download: true,
  //   //   header: true,
  //   //   delimiter: '\t',
  //   //   skipEmptyLines: true,
  //   //   quoteChar: '',
  //   //   complete: results => console.log(results)
  //   // })
  // }

  getDescriptors(): Descriptor[] {
    return this.decs
  }

}
