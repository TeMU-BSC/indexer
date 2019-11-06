import { Component, OnInit } from '@angular/core'
import { User, IUserResponse } from './user.class'
import { FormBuilder, FormGroup } from '@angular/forms'
import { AutocompleteAsyncService } from './autocomplete-async.service'
import { switchMap, debounceTime, tap, finalize } from 'rxjs/operators'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-autocomplete-async',
  templateUrl: './autocomplete-async.component.html',
  styleUrls: ['./autocomplete-async.component.css']
})
export class AutocompleteAsyncComponent implements OnInit {
  filteredUsers: User[] = []
  usersForm: FormGroup
  isLoading = false

  constructor(private fb: FormBuilder, private appService: AutocompleteAsyncService) { }

  ngOnInit() {
    this.usersForm = this.fb.group({
      userInput: null
    })

    this.usersForm
      .get('userInput')
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(value => this.appService.search({ name: value }, 1)
          .pipe(
            finalize(() => this.isLoading = false),
          )
        )
      )
      .subscribe(users => this.filteredUsers = users.results)
  }

  displayFn(user: User) {
    if (user) { return user.name }
  }

}
