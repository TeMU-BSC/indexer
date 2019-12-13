import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { User, Doc, Descriptor, Assignment, BackendResponse } from '../app.model'
import { Papa } from 'ngx-papaparse'
import * as ALL_DESCRIPTORS from 'src/assets/DeCS.2019.both.v5.json'


@Injectable({
  providedIn: 'root'
})
export class AppService {

  // ip = '84.88.52.79'
  ip = 'localhost'
  port = '8080'
  // port = '5000'

  headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' })
  options = { headers: this.headers }
  allDescriptors: Descriptor[] = (ALL_DESCRIPTORS as any).default
  currentUser: Observable<User>

  constructor(
    private http: HttpClient,
    // private papa: Papa
  ) { }

  getDocs(user: User): Observable<Doc[]> {
    return this.http.post<Doc[]>(`http://${this.ip}:${this.port}/doc/assigned`, user)
  }

  assignDocs(assignments: Assignment[]): Observable<any> {
    return this.http.post<any>(`http://${this.ip}:${this.port}/doc/assign/many`, assignments)
  }

  /**
   * limit the number of docs
   */
  // getDocs(total: number, start?: number): Observable<Doc[]> {
  //   const baseUrl = `http://${this.ip}:${this.port}/docs`
  //   let url = baseUrl
  //   if (total !== undefined) {
  //     url += `?total=${total}`
  //     if (start !== undefined) {
  //       url += `?start=${start}`
  //     }
  //   }
  //   return this.http.get<Doc[]>(url, this.options)
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
  addDescriptor(descriptor: Descriptor): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(`http://${this.ip}:${this.port}/descriptor/add`, descriptor)
  }

  /**
   * Remove an existing descriptor from database
   */
  removeDescriptor(descriptor: Descriptor): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(`http://${this.ip}:${this.port}/descriptor/remove`, descriptor)
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
   * Mark an docId as completed by the current user in database
   */
  addCompletedDoc(doc): Observable<Doc> {
    return this.http.post<Doc>(`http://${this.ip}:${this.port}/doc/complete/add`, doc)
  }

  /**
   * Mark an docId as uncompleted by the current user in database
   */
  removeCompletedDoc(doc): Observable<Doc> {
    return this.http.post<Doc>(`http://${this.ip}:${this.port}/doc/complete/remove`, doc)
  }

}
