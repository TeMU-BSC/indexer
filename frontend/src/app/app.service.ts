import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Annotator, Article, Descriptor } from './app.model'
import { Papa } from 'ngx-papaparse'
import * as ALL_DESCRIPTORS from 'src/assets/data/DeCS.2019.both.v5.json'
// import { _normalize } from 'src/app/components/descriptors/descriptors.component'  // TODO utils module

@Injectable({
  providedIn: 'root'
})
export class AppService {

  ip = '84.88.52.79'
  // ip = 'localhost'
  port = '5000'
  headers: HttpHeaders = new HttpHeaders({ Accept: 'application/json' })
  options = { headers: this.headers }
  allDescriptors: Descriptor[] = (ALL_DESCRIPTORS as any).default

  constructor(private http: HttpClient, private papa: Papa) { }

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

  /**
   * From JSON file
   */
  getDescriptors(): Observable<Descriptor[]> {
    return this.http.get<Descriptor[]>('assets/data/DeCS.2019.both.v5.json')
  }

  /**
   * From TSV file
   */
  // getDescriptorsFromTSV() {
  //   this.papa.parse('assets/data/DeCS.2019.both.v5.tsv', {
  //     download: true,
  //     header: true,
  //     delimiter: '\t',
  //     skipEmptyLines: true,
  //     quoteChar: '',
  //     complete: results => console.log(results)
  //   })
  // }

  /**
   * Add a new descriptor to database
   */
  // addDescriptor(descriptor: Descriptor): Observable<Descriptor> {
  //   const url = `http://${this.ip}:${this.port}/descriptor/add`
  //   return this.http.post<Descriptor>(url, descriptor, this.options)
  // }
  addDescriptor(descriptor: Descriptor) {
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
  removeDescriptor(descriptor: Descriptor) {
    return `DeCS ${descriptor.decsCode} removed!`
  }

  getDescriptorByDecsCode(decsCode: string): Descriptor {
    return this.allDescriptors.find(descriptor => descriptor.decsCode === decsCode)
  }

}
