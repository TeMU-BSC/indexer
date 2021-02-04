import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { _sortByOrder } from 'src/app/helpers/functions'
import { ApiResponse, Document, Indexing, Term } from 'src/app/models/interfaces'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public url = 'http://localhost:5000'
  public terms: Term[]

  constructor(
    private http: HttpClient,
  ) {
    this.getTerms()
  }

  getTerms() {
    this.http.get<Term[]>(`${this.url}/term?multiple=true`).subscribe(response => {
      this.terms = response.map(term => ({ code: term.code, term: term.term, terminology: term.terminology }))
    })
  }

  getAssignedDocs(query: any): Observable<Document[]> {
    const { userEmail, pageIndex, pageSize } = query
    return this.http.get<Document[]>(`${this.url}/docs/${userEmail}`)
  }

  addTermToDoc(indexing: Indexing): Observable<any> {
    return this.http.post<any>(`${this.url}/indexing`, indexing)
  }

  removeIndexing(indexing: Indexing): Observable<any> {
    return this.http.request<any>('delete', `${this.url}/indexing`, { body: indexing })
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

  getSuggestions(docToCheck: any): Observable<any> {
    return this.http.post<any>(`${this.url}/suggestions`, docToCheck)
  }

  saveValidatedIndexings(validatedIndexings: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/indexings_validated/add`, validatedIndexings)
  }

  getValidatedDecsCodes(validatedIndexings: any): Observable<any> {
    return this.http.post<any>(`${this.url}/indexings_validated/get`, validatedIndexings)
  }

  getDoc(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.url}/doc/${id}`)
  }

}
