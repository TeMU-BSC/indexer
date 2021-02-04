import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import * as PRECODED_DECS_CODES from 'src/assets/sourcedata/precoded_decs_codes.json'
import { _sortByOrder } from 'src/app/helpers/functions'
import { ApiResponse, Document, Indexing, Term } from 'src/app/models/interfaces'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // public url = environment.process.env.APP_API_URL
  public url = 'http://localhost:5000'

  options = {
    headers: new HttpHeaders('Access-Control-Allow-Credentials'),
    withCredentials: true
  }
  public terms: Term[]
  precodedDecsCodes: string[] = (PRECODED_DECS_CODES as any).default

  constructor(
    private http: HttpClient,
  ) {
    this.getTerms()
  }

  getTerms() {
    this.http.get<Term[]>(`${this.url}/term?multiple=true`).subscribe(response => this.terms = response)
  }

  getAssignedDocs(query: any): Observable<any> {
    const { userEmail, pageIndex, pageSize } = query
    return this.http.get<any>(`${this.url}/docs/${userEmail}`)
  }

  addTermToDoc(indexing: Indexing): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/indexing`, indexing)
  }

  removeIndexing(indexing: Indexing): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/indexing/remove`, indexing)
  }

  markAsCompleted(docToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark_doc_as/completed`, docToMark)
  }

  markAsUncompleted(docToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark_doc_as/uncompleted`, docToMark)
  }

  markAsValidated(docToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark_doc_as/validated`, docToMark)
  }

  markAsUnvalidated(dockToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark_doc_as/unvalidated`, dockToMark)
  }

  getSuggestions(docToCheck: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/suggestions`, docToCheck)
  }

  saveValidatedIndexings(validatedIndexings: any[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/indexings_validated/add`, validatedIndexings)
  }

  getValidatedDecsCodes(validatedIndexings: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.url}/indexings_validated/get`, validatedIndexings)
  }

  getDoc(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.url}/doc/${id}`)
  }

}
