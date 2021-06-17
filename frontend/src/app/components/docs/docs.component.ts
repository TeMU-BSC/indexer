import { Component, OnInit,ViewChild,AfterViewInit } from '@angular/core'
import { PageEvent } from '@angular/material/paginator'
import { TableColumn, Width } from 'simplemattable'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { Document,Validation,ValidationTime } from 'src/app/models/interfaces'
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements AfterViewInit {

  columns = []
  docs: Document[] = []
  selectedDoc: Document
  loading: boolean
  paginatorLength: number
  firstTimeValidation: boolean
  firstTime: boolean

  //Pagination properties
  currentPage: number;
  itemsPerPage: number;
  displayedColumns: string[];
  dataSource: MatTableDataSource<Document>;
  private paginator: MatPaginator;
  private sort: MatSort;


  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }



  constructor(
    private api: ApiService,
    public auth: AuthService
  ) {

    this.dataSource = new MatTableDataSource([]);
    this.refresh();

    if(this.auth.getCurrentUser().role === "validator"){
      this.displayedColumns = ['identifier', 'title', 'type', 'source','validated'];
    }else{
      this.displayedColumns = ['identifier', 'title', 'type', 'source','completed'];
    }

  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  ngAfterViewInit() { }

  refresh(event?: PageEvent) {
    this.loading = true
    if(this.auth.getCurrentUser().role === 'validator'){
      this.api.getAssignedUsers({
        userEmail: this.auth.getCurrentUser().email
      }).subscribe(
        response => {
          this.docs = response['documents'];
          this.dataSource = new MatTableDataSource(response['documents']);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error => console.error(error),
        () =>{
          this.firstTimeValidationFunc()
          this.loading = false
        }
      )

    }else{
      this.api.getAssignedDocs({
        userEmail: this.auth.getCurrentUser().email
      }).subscribe(
        response => {
          this.docs = response['documents'];
          this.dataSource = new MatTableDataSource(response['documents']);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
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
        console.log("term")
        console.log(term)
        const validation: Validation = {
          document_identifier:doc.identifier,
          identifier: `${doc.identifier}-${term.code}-${email}-${doc.user_email}`,
          user_email: doc.user_email,
          validator_email: email,
          term_code: term.code
        }
        Validations.push(validation)
      });

      if(Validations.length > 0){
        this.api.addAnnotationValidator(Validations).subscribe(response => {
        },error => {console.log("error")} )
      }
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

  onSelect(row: Document) {

    if(this.auth.getCurrentUser().role === "validator"){
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
    }

    this.selectedDoc = row
  }

  loadValidationFirstTime(timer: ValidationTime){

    if(this.firstTimeValidation ){this.api.addValidationFirstTime(timer).subscribe(
      response => {
      },error => console.log(error)

    )}

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }





}
