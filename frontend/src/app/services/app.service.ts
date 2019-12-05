import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { User, Article, Descriptor } from '../app.model'
import { Papa } from 'ngx-papaparse'
import * as ALL_DESCRIPTORS from 'src/assets/DeCS.2019.both.v5.json'


@Injectable({
  providedIn: 'root'
})
export class AppService {

  // ip = '84.88.52.79'
  ip = 'localhost'
  port = '5000'
  headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' })
  options = { headers: this.headers }
  allDescriptors: Descriptor[] = (ALL_DESCRIPTORS as any).default
  currentUser: Observable<User>

  constructor(
    private http: HttpClient,
    // private papa: Papa
  ) { }

  getArticles(user: User): Observable<Article[]> {
    return this.http.post<Article[]>(`http://${this.ip}:${this.port}/article/all`, user)
  }

  /**
   * limit the number of articles
   */
  // getArticles(total: number, start?: number): Observable<Article[]> {
  //   const baseUrl = `http://${this.ip}:${this.port}/articles`
  //   let url = baseUrl
  //   if (total !== undefined) {
  //     url += `?total=${total}`
  //     if (start !== undefined) {
  //       url += `?start=${start}`
  //     }
  //   }
  //   return this.http.get<Article[]>(url, this.options)
  // }

  /**
   * From JSON file
   */
  getDescriptors(): Observable<Descriptor[]> {
    return this.http.get<Descriptor[]>('assets/DeCS.2019.both.v5.json')
  }

  /**
   * From TSV file
   */
  // getDescriptorsFromTSV() {
  //   this.papa.parse('assets/DeCS.2019.both.v5.tsv', {
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
  addDescriptor(descriptor: Descriptor): Observable<Descriptor> {
    return this.http.post<Descriptor>(`http://${this.ip}:${this.port}/descriptor/add`, descriptor)
  }

  /**
   * Remove an existing descriptor from database
   */
  removeDescriptor(descriptor: Descriptor): Observable<Descriptor> {
    return this.http.post<Descriptor>(`http://${this.ip}:${this.port}/descriptor/remove`, descriptor)
  }

  findDescriptorByDecsCode(decsCode: string): Descriptor {
    return this.allDescriptors.find(descriptor => descriptor.decsCode === decsCode)
  }

  /**
   * Return the JSON parsed content of the selected file read from the event.
   * @param event file upload event
   */
  // public onFileSelected(event): any {
  //   let parsedContent = {}
  //   const fileReader = new FileReader()
  //   fileReader.readAsText(event.target.files[0], 'UTF-8')
  //   fileReader.onloadend = () => parsedContent = JSON.parse(fileReader.result as string)
  //   fileReader.onerror = error => console.error(error)
  //   console.log(parsedContent)
  //   return parsedContent
  // }

  /**
   * Mark an articleId as completed by the current user in database
   */
  addCompletedArticle(article): Observable<Article> {
    return this.http.post<Article>(`http://${this.ip}:${this.port}/article/complete/add`, article)
  }

  /**
   * Mark an articleId as uncompleted by the current user in database
   */
  removeCompletedArticle(article): Observable<Article> {
    return this.http.post<Article>(`http://${this.ip}:${this.port}/article/complete/remove`, article)
  }

}
