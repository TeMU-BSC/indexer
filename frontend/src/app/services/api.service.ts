import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, of } from 'rxjs'

import { Papa } from 'ngx-papaparse'

import { environment } from 'src/environments/environment'
import { ApiResponse, Annotation, PaginatedResponse } from 'src/app/models/api'
import { Doc, Descriptor } from 'src/app/models/decs'
import { _sortByOrder } from 'src/app/utilities/functions'
import * as PRECODED_DECS_CODES from 'src/assets/sourcedata/precoded_decs_codes.json'


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public url = environment.process.env.APP_API_URL
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
  getAssignedDocs(assignment: any): Observable<PaginatedResponse> {
    return this.http.post<PaginatedResponse>(`${this.url}/assignment/get`, assignment)
  }

  assignDocsToUsers(assignments: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/assignment/add`, assignments)
  }

  /**
   * Send a new annotation to add to the backend.
   */
  addAnnotation(annotation: Annotation): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/annotation/add`, annotation)
  }

  /**
   * Send an existing annotation to remove to the backend.
   */
  removeAnnotation(annotation: Annotation): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/annotation/remove`, annotation)
  }

  /**
   * Mark an doc as completed by the current user in database.
   */
  markAsCompleted(docToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${this.url}/mark_doc_as/completed`, docToMark)
  }

  /**
   * Mark an doc as uncompleted by the current user in database.
   */
  markAsUncompleted(docToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${this.url}/mark_doc_as/uncompleted`, docToMark)
  }

  /**
   * Mark an doc as validated by the current user in database.
   */
  markAsValidated(docToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${this.url}/mark_doc_as/validated`, docToMark)
  }

  /**
   * Mark an doc as unvalidated by the current user in database.
   */
  markAsUnvalidated(dockToMark: any): Observable<Doc> {
    return this.http.post<Doc>(`${this.url}/mark_doc_as/unvalidated`, dockToMark)
  }

  /**
   * Get the decs codes for a specific document from other annotators that have marked as completed that same document.
   */
  getSuggestions(docToCheck: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/suggestions`, docToCheck)
  }

  /**
   * Save some validated annotations to be defenitely stored in database.
   */
  saveValidatedAnnotations(validatedAnnotations: any[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/annotations_validated/add`, validatedAnnotations)
  }

  /**
   * Get the validated decs codes for a specific document.
   */
  getValidatedDecsCodes(validatedAnnotations: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/annotations_validated/get`, validatedAnnotations)
  }

  /**
   * Get a document by its id.
   */
  getDoc(id: string): Observable<Doc> {
    return this.http.get<Doc>(`${this.url}/doc/${id}`)
  }

}
