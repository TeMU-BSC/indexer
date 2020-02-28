import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, ParamMap } from '@angular/router'
import { switchMap } from 'rxjs/operators'
import { ApiService } from 'src/app/services/api.service'
import { Observable } from 'rxjs'
import { Doc } from 'src/app/models/decs'
import { FormConfig } from 'src/app/models/form'

@Component({
  selector: 'app-doc-detail',
  templateUrl: './doc-detail.component.html',
  styleUrls: ['./doc-detail.component.scss']
})
export class DocDetailComponent implements OnInit {

  doc$: Observable<Doc>

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit(): void {
    this.doc$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.api.getDoc(params.get('id')))
    )
  }

}
