import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
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

  public allDescriptors: Descriptor[]
  precodedDecsCodes: string[] = (PRECODED_DECS_CODES as any).default
  public revisionMode = false

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

    // let precodedDescriptors: Descriptor[]
    // this.papa.parse('assets/sourcedata/DeCS.precoded.tsv', {
    //   download: true,
    //   header: true,
    //   delimiter: '\t',
    //   skipEmptyLines: true,
    //   quoteChar: '',
    //   complete: results => precodedDescriptors = results.data
    // })
    // return _sortByOrder(precodedDescriptors, this.precodedDecsCodes, 'decsCode')
  }

  /**
   * Get the assigned docs to the current user.
   */
  getAssignedDocs(assignment: any): Observable<Doc[]> {
    return this.http.post<Doc[]>(`${environment.apiUrl}/document/assigned`, assignment)
  }

  assignDocsToUsers(assignments: any[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/document/assign/many`, assignments)
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
  addCompletion(completion: any): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/completion/add`, completion)
  }

  /**
   * Mark an doc as uncompleted by the current user in database.
   */
  removeCompletion(completion: any): Observable<Doc> {
    return this.http.post<Doc>(`${environment.apiUrl}/completion/remove`, completion)
  }

  /**
   * Toggle between normal mode and revision mode.
   */
  toggleMode() {
    this.revisionMode = !this.revisionMode
  }

}
