import { Injectable } from '@angular/core'
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

  BROWSER_STORAGE_KEY = 'mesinesp'
  user: User

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private router: Router,
    public dialog: MatDialog,
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

  /**
   * Register new users.
   */
  public registerMany(users: User[]): Observable<any> {
    return this.http.post<any>(`${this.api.url}/user/register`, users)
  }

  /**
   * Log in an existing user.
   */
  public login(user: User): void {
    this.http.post(`${this.api.url}/user/login`, user).subscribe(
      (response: ApiResponse) => {
        if (response.message) {
          alert(response.message)
        } else if (response.user) {
          this.user = response.user
          localStorage.setItem(this.BROWSER_STORAGE_KEY, JSON.stringify(this.user))
        }
      }
    )
  }

  /**
   * Log out the current user.
   */
  public logout(): void {
    localStorage.removeItem(this.BROWSER_STORAGE_KEY)
    this.router.navigateByUrl('/')
  }

  /**
   * Check if any user is logged in.
   */
  public isLoggedIn(): boolean {
    return localStorage.getItem(this.BROWSER_STORAGE_KEY) !== null
  }

  /**
   * Get the data from the current logged user.
   */
  public getCurrentUser(): User {
    if (this.isLoggedIn()) {
      return JSON.parse(localStorage.getItem(this.BROWSER_STORAGE_KEY))
    }
  }

  /**
   * Open a material dialog to enter the email and password.
   */
  public openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '300px',
      data: { user: new User() }
    })
    dialogRef.afterClosed().subscribe(data => this.login(data.user))
  }

}
