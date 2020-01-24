import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'

import { Papa } from 'ngx-papaparse'

import { environment } from 'src/environments/environment'
import { Doc, Descriptor, ApiResponse } from 'src/app/app.model'
import { _sortByOrder } from 'src/app/utilities/functions'
import * as PRECODED_DECS_CODES from 'src/assets/sourcedata/precoded_decs_codes.json'


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  options = {
    headers: new HttpHeaders('Access-Control-Allow-Credentials'),
    withCredentials: true
  }
  public allDescriptors: Descriptor[]
  precodedDecsCodes: string[] = (PRECODED_DECS_CODES as any).default

  constructor(
    private http: HttpClient,
    private papa: Papa
  ) {
    this.getAllDescriptors()
  }

  /**
   * Get all descriptors from TSV file.
   */
  getAllDescriptors() {
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
   * Find the most frequently used descriptors in document indexing, descendingly ordered by frequent use.
   */
  getPrecodedDescriptors(): Descriptor[] {
    const precodedDescriptors = this.allDescriptors.filter(descriptor => this.precodedDecsCodes.includes(descriptor.decsCode))
    return _sortByOrder(precodedDescriptors, this.precodedDecsCodes, 'decsCode')
  }

  /**
   * Get the assigned docs to the current user.
   */
  getAssignedDocs(assignment: any): Observable<Doc[]> {
    return this.http.post<Doc[]>(`${environment.apiUrl}/assignment/get`, assignment)
  }

  assignDocsToUsers(assignments: any[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/assignment/add`, assignments)
  }

  /**
   * Send a new annotation to add to the backend.
   */
  addAnnotation(annotation: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/annotation/add`, annotation)
  }

  /**
   * Send an existing annotation to remove to the backend.
   */
  removeAnnotation(annotation: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/annotation/remove`, annotation)
  }

  /**
   * Mark an doc as completed by the current user in database.
   */
  addCompletion(docToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/completion/add`, docToMark)
  }

  /**
   * Mark an doc as uncompleted by the current user in database.
   */
  removeCompletion(docToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/completion/remove`, docToMark)
  }

  /**
   * Mark an doc as validated by the current user in database.
   */
  addValidation(docToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/validation/add`, docToMark)
  }

  /**
   * Mark an doc as unvalidated by the current user in database.
   */
  removeValidation(dockToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/validation/remove`, dockToMark)
  }

}
