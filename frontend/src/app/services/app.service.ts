import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
// import { Papa } from 'ngx-papaparse'

import * as ALL_DESCRIPTORS from 'src/assets/DeCS.2019.both.v5.json'
import { User, Doc, Descriptor, Assignment, ApiResponse } from '../app.model'
import { baseUrl } from './api'


@Injectable({
  providedIn: 'root'
})
export class AppService {

  headers: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' })
  options = { headers: this.headers }
  allDescriptors: Descriptor[] = (ALL_DESCRIPTORS as any).default

  constructor(
    private http: HttpClient,
    // private papa: Papa
  ) { }

  /**
   * Parse TSV file with papaparse
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
   * From JSON file
   */
  getDescriptors(): Observable<Descriptor[]> {
    return this.http.get<Descriptor[]>('assets/DeCS.2019.both.v5.json')
  }

  getDocs(user: User): Observable<Doc[]> {
    return this.http.post<Doc[]>(`${baseUrl}/document/assigned`, user)
  }

  assignDocs(assignments: Assignment[]): Observable<any> {
    return this.http.post<any>(`${baseUrl}/document/assign/many`, assignments)
  }

  /**
   * Add a new descriptor to database
   */
  addDescriptor(descriptor: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${baseUrl}/descriptor/add`, descriptor)
  }

  /**
   * Remove an existing descriptor from database
   */
  removeDescriptor(descriptor: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${baseUrl}/descriptor/remove`, descriptor)
  }

  findDescriptorByDecsCode(decsCode: string): Descriptor {
    return this.allDescriptors.find(descriptor => descriptor.decsCode === decsCode)
  }

  /**
   * Mark an docId as completed by the current user in database
   */
  addCompletedDoc(doc): Observable<Doc> {
    return this.http.post<Doc>(`${baseUrl}/document/complete/add`, doc)
  }

  /**
   * Mark an docId as uncompleted by the current user in database
   */
  removeCompletedDoc(doc): Observable<Doc> {
    return this.http.post<Doc>(`${baseUrl}/document/complete/remove`, doc)
  }

}
