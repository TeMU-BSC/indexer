import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Papa } from 'ngx-papaparse'

import { environment } from 'src/environments/environment'
import { User, Doc, Descriptor, Assignment, ApiResponse } from 'src/app/app.model'
import { _mapOrder } from 'src/app/utilities/functions'
import * as PRECODED_DECS_CODES from 'src/assets/sourcedata/precoded_decs_codes.json'


@Injectable({
  providedIn: 'root'
})
export class AppService {

  public allDescriptors: Descriptor[]
  public precodedDecsCodes: string[] = (PRECODED_DECS_CODES as any).default

  constructor(
    private http: HttpClient,
    private papa: Papa
  ) {
    // Get all the descriptor objects parsing a TSV file
    this.papa.parse('assets/sourcedata/DeCS.2019.both.v5.tsv', {
      download: true,
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
      quoteChar: '',
      complete: results => this.allDescriptors = results.data
    })
  }

  /**
   * Get the assigned docs to the current user.
   */
  getAssignedDocs(user: User): Observable<Doc[]> {
    return this.http.post<Doc[]>(`${environment.apiUrl}/document/assigned`, user)
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
   * Find the most frequently used descriptors in document indexing, descendingly ordered by frequent use.
   */
  getPrecodedDescriptors(): Descriptor[] {
    const precodedDescriptors = this.allDescriptors.filter(descriptor => this.precodedDecsCodes.includes(descriptor.decsCode))
    return _mapOrder(precodedDescriptors, this.precodedDecsCodes, 'decsCode')
  }

}
