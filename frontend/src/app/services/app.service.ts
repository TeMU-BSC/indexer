import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
// import { Papa } from 'ngx-papaparse'

import { environment } from 'src/environments/environment'
import { User, Doc, Descriptor, Assignment, ApiResponse } from 'src/app/app.model'
import * as ALL_DESCRIPTORS from 'src/assets/DeCS.2019.both.v5.json'
import * as PRECODED_DECS_CODES from 'src/assets/precoded_decs_codes.json'


@Injectable({
  providedIn: 'root'
})
export class AppService {

  options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
  public allDescriptors: Descriptor[] = (ALL_DESCRIPTORS as any).default
  public precodedDecsCodes: string[] = (PRECODED_DECS_CODES as any).default

  constructor(
    private http: HttpClient,
    // private papa: Papa
  ) { }

  /**
   * Get all the descriptor objects parsing a TSV file.
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
   * Get the assigned docs to the current user.
   */
  getDocs(user: User): Observable<Doc[]> {
    return this.http.post<Doc[]>(`${environment.apiUrl}/document/assigned`, user, this.options)
  }

  assignDocs(assignments: Assignment[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/document/assign/many`, assignments)
  }

  /**
   * Send a new descriptor to add to the backend.
   */
  addDescriptor(descriptor: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/descriptor/add`, descriptor)
  }

  /**
   * Send an existing descriptor to remove to the backend.
   */
  removeDescriptor(descriptor: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/descriptor/remove`, descriptor)
  }

  /**
   * Mark an docId as completed by the current user in database.
   */
  addCompletedDoc(doc): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/document/complete/add`, doc)
  }

  /**
   * Mark an docId as uncompleted by the current user in database.
   */
  removeCompletedDoc(doc): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/document/complete/remove`, doc)
  }


  /**
   * Find an specific descriptor object by its decsCode.
   */
  findDescriptorByDecsCode(decsCode: string): Descriptor {
    return this.allDescriptors.find(descriptor => descriptor.decsCode === decsCode)
  }

  /**
   * Find the most frequently used descriptors in document indexing.
   */
  getPrecodedDescriptors(): Descriptor[] {
    const precodedDescriptors = this.allDescriptors.filter(descriptor => this.precodedDecsCodes.includes(descriptor.decsCode))
    return this.mapOrder(precodedDescriptors, this.precodedDecsCodes, 'decsCode')
  }

  /**
   * Order an array of objects based on another array order, by one of its existing keys.
   * Based on the code snippet: https://gist.github.com/ecarter/1423674#gistcomment-3065491
   */
  mapOrder = (array: any[], order: any[], key: string) => {
    return array.sort((a, b) => order.indexOf(a[key]) > order.indexOf(b[key]) ? 1 : -1)
  }

}
