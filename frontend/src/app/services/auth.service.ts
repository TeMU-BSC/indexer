import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { HttpClient } from '@angular/common/http'
import { Router, CanActivate } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { Observable } from 'rxjs'

import { environment } from 'src/environments/environment'
import { User } from 'src/app/models/user'
import { ApiResponse } from 'src/app/models/api'
import { LoginComponent } from 'src/app/components/login/login.component'
import { ApiService } from './api.service'


@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  browserStorageKey = environment.process.env.APP_BROWSER_STORAGE_KEY
  user: User

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    public dialog: MatDialog,
    private title: Title,
  ) { }

  /**
   * Prevent loading certain pages without being logged in.
   */
  canActivate() {
    if (!this.isLoggedIn()) {
      this.openLoginDialog()
      return false
    }
    return true
  }

  public registerUser(user: User): Observable<any> {
    return this.http.request<User>('post', `${this.api.url}/insert/user`, { body: user })
  }

  public deleteUser(user: User): Observable<any> {
    return this.http.request<any>('delete', `${this.api.url}/delete/user`, { body: user })
  }

  public registerManyUsers(users: User[]): Observable<any> {
    return this.http.post<any>(`${this.api.url}/insert/users`, users)
  }

  public login(user: User): void {
    console.log(user)
    this.http.request('get', `${this.api.url}/find/user`, { body: user }).subscribe(
      response => {
        if (response['found_item']) {
          this.user = response['found_item']
          localStorage.setItem(this.browserStorageKey, JSON.stringify(this.user))
          this.title.setTitle(`Indizador - ${this.user.email}`)
        }
      }
    )
  }

  public logout(): void {
    localStorage.removeItem(this.browserStorageKey)
    this.title.setTitle(`Indizador`)
    this.router.navigateByUrl('/')
  }

  public isLoggedIn(): boolean {
    return localStorage.getItem(this.browserStorageKey) !== null
  }

  public getCurrentUser(): User {
    if (this.isLoggedIn()) {
      return JSON.parse(localStorage.getItem(this.browserStorageKey))
    }
  }

  public openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '300px',
      data: { user: new User() }
    })
    dialogRef.afterClosed().subscribe(data => this.login(data.user))
  }

}
