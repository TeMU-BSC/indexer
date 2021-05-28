import { Component, OnInit } from '@angular/core'
import { PageEvent } from '@angular/material/paginator'
import { TableColumn, Width } from 'simplemattable'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { Document,Validation,ValidationTime } from 'src/app/models/interfaces'


@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit {

  columns = []
  docs: Document[] = []
  selectedDoc: Document
  loading: boolean
  paginatorLength: number
  firstTimeValidation: boolean
  firstTime: boolean

  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {


    if(this.auth.getCurrentUser().role === "validator"){
      this.columns = [
        new TableColumn<Document, 'identifier'>('Identificador', 'identifier')
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'title'>('Título', 'title')
          .isHiddenXs(true)
          .withWidth(Width.pct(75))
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'source'>('Fuente', 'source')
          .isHiddenXs(true)
          .withWidth(Width.pct(75))
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'type'>('Tipo', 'type')
          .isHiddenXs(true)
          .withWidth(Width.pct(75))
          .withColFilter().withColFilterLabel('Filtrar'),
        // new TableColumn<Document, 'completed'>('Completado', 'completed')
        //   .withColFilter().withColFilterLabel('Filtrar')
        //   .withTransform(completed => completed ? 'Sí' : 'No')
        //   .withNgStyle(completed => ({ color: completed ? 'green' : 'red' })),
        new TableColumn<Document, 'validated'>('Validado', 'validated')
          .withColFilter().withColFilterLabel('Filtrar')
          .withTransform(validated => validated ? 'Sí' : 'No')
          .withNgStyle(validated => ({ color: validated ? 'green' : 'red' })),
      ]
    }else{
      this.columns = [
        new TableColumn<Document, 'identifier'>('Identificador', 'identifier')
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'title'>('Título', 'title')
          .isHiddenXs(true)
          .withWidth(Width.pct(75))
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'source'>('Fuente', 'source')
          .isHiddenXs(true)
          .withWidth(Width.pct(75))
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'type'>('Tipo', 'type')
          .isHiddenXs(true)
          .withWidth(Width.pct(75))
          .withColFilter().withColFilterLabel('Filtrar'),
        new TableColumn<Document, 'completed'>('Completado', 'completed')
          .withColFilter().withColFilterLabel('Filtrar')
          .withTransform(completed => completed ? 'Sí' : 'No')
          .withNgStyle(completed => ({ color: completed ? 'green' : 'red' })),
        // new TableColumn<Document, 'validated'>('Validado', 'validated')
        //   .withColFilter().withColFilterLabel('Filtrar')
        //   .withTransform(validated => validated ? 'Sí' : 'No')
        //   .withNgStyle(validated => ({ color: validated ? 'green' : 'red' })),
      ]
    }

  }

  ngOnInit() {

  }

  refreshPage(event: PageEvent) {

    this.loading = true

    if(this.auth.getCurrentUser().role === 'validator'){
      this.api.getAssignedUsers({
        userEmail: this.auth.getCurrentUser().email,
        pageSize: event.pageSize,
        pageIndex: event.pageIndex,

      }).subscribe(
        response => {
           this.docs = response['documents']
           this.paginatorLength = response['total_document_count']
        },
        error => console.error(error),
        () =>{


          this.firstTimeValidationFunc()
          this.loading = false
        }
      )
    }else{
      this.api.getAssignedDocs({
        userEmail: this.auth.getCurrentUser().email,
        pageSize: event.pageSize,
        pageIndex: event.pageIndex,
      }).subscribe(
        response => {
          this.docs = response['documents']
          this.paginatorLength = response['total_document_count']
        },
        error => console.error(error),
        () => this.loading = false
      )

    }
  }

  firstTimeValidationFunc(){
    for (let index = 0; index < this.docs.length; index++) {
      const doc = this.docs[index];
      const FirstTimeValidation: Validation = {
        document_identifier: doc.identifier,
        user_email: doc.user_email,
        validator_email: this.auth.getCurrentUser().email,
        term_code: "",
        identifier: ""
    }
    this.api.getFirstTimeValidation(FirstTimeValidation).subscribe(response => {
      this.firstTime = response.firsttime
    },
    error => {},
    () =>{
      this.loadTermsToValidatorAnnotation(doc)
    })


    }


  }

  loadTermsToValidatorAnnotation(doc:Document){
    let terms = doc.terms
    const email = this.auth.getCurrentUser().email
    let Validations = []
    if(this.firstTime){
      terms.forEach(term => {
        const validation: Validation = {
          document_identifier:doc.identifier,
          identifier: `${doc.identifier}-${term.code}-${email}-${doc.user_email}`,
          user_email: doc.user_email,
          validator_email: email,
          term_code: term.code
        }
        Validations.push(validation)
      });
      this.api.addAnnotationValidator(Validations).subscribe(response => {
      },error => {} )
    }
  }



  refreshDoc() {
    setTimeout(function(){window.location.reload()},500);
    this.loading = true
    this.api.getDoc(this.selectedDoc.identifier).subscribe(
      response => {
        const docIndex = this.docs.indexOf(this.selectedDoc)
        this.docs.splice(docIndex, 1, response)
      },
      error => console.error(error),
      () => this.loading = false
    )
  }

  selectDoc(row: Document) {

    const timer : ValidationTime = {
      identifier: row.identifier+"-"+row.user_email+"-"+this.auth.getCurrentUser().email,
      document : row.identifier,
      annotator_email: row.user_email,
      validator_email: this.auth.getCurrentUser().email,
      opened_first_time: new Date(),
      validate: false,
      validated_time: null
    }
    this.api.getFirstTimeValidationTime(timer).subscribe(
      response=>{

        this.firstTimeValidation = response['firsttime']
      },error => console.log(error),
      ()=> this.loadValidationFirstTime(timer)
    )
    this.selectedDoc = row
  }

  loadValidationFirstTime(timer: ValidationTime){

    if(this.firstTimeValidation ){this.api.addValidationFirstTime(timer).subscribe(
      response => {
        console.log(response)
      },error => console.log(error)

    )}

  }



}
