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
  ip = '84.88.52.79'
  // ip = 'localhost'
  port = '5000'
  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })
  options = { headers: this.headers }

  constructor(
    private http: HttpClient
  ) { }

  login(annotator: Annotator) {
    // const url = `http://${this.ip}:${this.port}/login`
    // return this.http.post<Annotator>(url, annotator, this.options)
    return 'OK'
  }

  getAnnotators(): Observable<Annotator[]> {
    return this.http.get<Annotator[]>('assets/data/annotators_dummy.json')
    // const url = 'assets/data/articles.json'
    // return this.http.get<Article>(url, options)
  }

  getArticles(total: number, start?: number): Observable<Article[]> {
    return this.http.get<Article[]>('assets/data/articles_dummy.json')

    // const baseUrl = `http://${this.ip}:${this.port}/articles`
    // let url = baseUrl
    // if (total !== undefined) {
    //   url += `?total=${total}`
    //   if (start !== undefined) {
    //     url += `?start=${start}`
    //   }
    // }
    // return this.http.get<Article[]>(url, this.options)
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

  /**
   * Add a new descriptor to database
   */
  // addDescriptor(descriptor: Descriptor): Observable<Descriptor> {
  //   const url = `http://${this.ip}:${this.port}/descriptor/add`
  //   return this.http.post<Descriptor>(url, descriptor, this.options)
  // }
  addDescriptor(descriptor: Descriptor): string {
    return `DeCS ${descriptor.decsCode} added!`
  }

  /**
   * Remove a new descriptor from database
   */
  // removeDescriptor(descriptor: Descriptor): Observable<Descriptor> {
  //   const url = `http://${this.ip}:${this.port}/descriptor/remove`
  //   const deleteOptions = { headers: this.headers, body: descriptor }
  //   return this.http.delete<Descriptor>(url, deleteOptions)
  // }
  removeDescriptor(descriptor: Descriptor): string {
    return `DeCS ${descriptor.decsCode} removed!`
  }
}
