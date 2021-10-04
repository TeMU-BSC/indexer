import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { _sortByOrder } from 'src/app/helpers/functions'
import { ApiResponse, Document, Annotation, Term, Validation, ValidationTime} from 'src/app/models/interfaces'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url = environment.apiUrl

  constructor(
    private http: HttpClient,
  ) { }

  getTerms(): Observable<Term[]> {
    return this.http.get<Term[]>(`${this.url}/term?multiple=true`)
  }

  getTermList(query: any): Observable<Term[]> {
    const { document_identifier, user_email } = query
    return this.http.get<Term[]>(`${this.url}/getTermList?document_identifier=${document_identifier}&user_email=${user_email}`)
  }

  addDocuments(documents: Document[]): Observable<ApiResponse> {
    return this.http.request<ApiResponse>('post', `${this.url}/document`, { body: documents })
  }

  addDocumentToClassify(documents: Document[]): Observable<ApiResponse>{
    return this.http.request<ApiResponse>('post', `${this.url}/documentToLabel`, {body: documents})
  }

  addTerms(terms: Term[]): Observable<ApiResponse> {
    return this.http.request<ApiResponse>('post', `${this.url}/term`, { body: terms })
  }

  deleteDocuments(documents: Document[]): Observable<ApiResponse> {
    return this.http.request<ApiResponse>('delete', `${this.url}/document`, { body: documents })
  }

  getAssignedDocs(query: any): Observable<any[]> {
    const { userEmail, pageSize, pageIndex } = query
    return this.http.get<any[]>(`${this.url}/docs/${userEmail}?page_size=${pageSize}&page_index=${pageIndex}`)
  }

  getAssignedUsers(query: any): Observable<any[]> {
    const { userEmail, pageSize, pageIndex } = query
    return this.http.get<any[]>(`${this.url}/docs/validate/${userEmail}?page_size=${pageSize}&page_index=${pageIndex}`)
  }


  addAnnotation(annotation: Annotation): Observable<any> {
    return this.http.post<any>(`${this.url}/annotation`, annotation)
  }
  addAnnotationValidator(validation: any): Observable<any>{
    return this.http.post<any>(`${this.url}/validation`, validation)
  }

  addValidationFirstTime(validationTime: ValidationTime): Observable<any>{
    return this.http.post<any>(`${this.url}/validationTime`, validationTime)
  }

  removeAnnotation(annotation: Annotation): Observable<any> {
    return this.http.request<any>('delete', `${this.url}/annotation`, { body: [annotation] })
  }

  removeValidation(annotation: Annotation): Observable<any> {
    return this.http.request<any>('delete', `${this.url}/validation`, { body: [annotation] })
  }

  markAsCompleted(docToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark-doc-as/completed`, docToMark)
  }

  markAsUncompleted(docToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark-doc-as/uncompleted`, docToMark)
  }

  markAsValidated(docToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark-doc-as/validated`, docToMark)
  }

  updateFinishValidationTime(validatioTime: any): Observable<any>{
    return this.http.post<any>(`${this.url}/validationTime/finished`,validatioTime)
  }

  markAsUnvalidated(dockToMark: any): Observable<Document> {
    return this.http.post<Document>(`${this.url}/mark-doc-as/unvalidated`, dockToMark)
  }

  getSuggestions(docToCheck: any): Observable<any> {
    return this.http.post<any>(`${this.url}/suggestions`, docToCheck)
  }

  saveValidatedAnnotations(validatedAnnotations: any[]): Observable<any> {
    return this.http.post<any>(`${this.url}/annotations_validated/add`, validatedAnnotations)
  }

  getValidatedDecsCodes(validatedAnnotations: any): Observable<any> {
    return this.http.post<any>(`${this.url}/annotations_validated/get`, validatedAnnotations)
  }

  getDoc(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.url}/doc/${id}`)
  }

  getTermsAnnotationValidator(terms: any): Observable<any>{
    return this.http.post<any>(`${this.url}/validation/terms`, terms)
  }
  getFirstTimeValidation(validation: Validation): Observable<any>{
    return this.http.post<any>(`${this.url}/validation/firsttime`,validation)
  }
  getFirstTimeValidationTime(validationTime: ValidationTime): Observable<any>{
    return this.http.post<any>(`${this.url}/validationTime/firsttime`,validationTime)
  }



}
