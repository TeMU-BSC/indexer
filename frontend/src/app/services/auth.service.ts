import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router, CanActivate } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { Observable } from 'rxjs'

import { environment } from 'src/environments/environment'
import { User, ApiResponse } from 'src/app/app.model'
import { LoginComponent } from 'src/app/components/login/login.component'


@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  USER_KEY = 'user'
  user: User

  constructor(
    private http: HttpClient,
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
    return this.http.post<any>(`${environment.apiUrl}/user/register`, users)
  }

  /**
   * Log in an existing user.
   */
  public login(user: User): void {
    this.http.post(`${environment.apiUrl}/user/login`, user).subscribe(
      (response: ApiResponse) => {
        if (response.message) {
          alert(response.message)
        } else if (response.user) {
          this.user = response.user
          localStorage.setItem(this.USER_KEY, JSON.stringify(this.user))
        }
      }
    )
  }

  /**
   * Log out the current user.
   */
  public logout(): void {
    localStorage.removeItem(this.USER_KEY)
    this.router.navigateByUrl('/')
  }

  /**
   * Check if any user is logged in.
   */
  public isLoggedIn(): boolean {
    return localStorage.getItem(this.USER_KEY) !== null
  }

  /**
   * Get the data from the current logged user.
   */
  public getCurrentUser(): User {
    if (this.isLoggedIn()) {
      return JSON.parse(localStorage.getItem(this.USER_KEY))
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
