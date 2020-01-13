// https://github.com/ArjunAranetaCodes/MoreCodes-Youtube/tree/master/angular-flask-mongodb-login-reg

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { Observable } from 'rxjs'

import { User, ApiResponse } from 'src/app/app.model'
import { environment } from 'src/environments/environment'
import { LoginComponent } from '../components/login/login.component'


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  BROWSER_SESSION_KEY = 'loggedUser'
  user: User

  constructor(
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  /**
   * Register many new users.
   */
  public registerMany(users: User[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/user/register/many`, users)
  }

  /**
   * Log in an existing user.
   */
  public login(user: User): void {
    this.http.post(`${environment.apiUrl}/user/login`, user).subscribe(
      (response: ApiResponse) => {
        if (response.user) {
          this.user = response.user
          localStorage.setItem(this.BROWSER_SESSION_KEY, JSON.stringify(this.user))
        }
        if (response.invalidCredentials) {
          alert(response.invalidCredentials)
        }
      },
      error => console.error(error),
      () => this.router.navigateByUrl('/docs')
    )
  }

  /**
   * Log out the current logged user
   */
  public logout(): void {
    localStorage.removeItem(this.BROWSER_SESSION_KEY)
    this.router.navigateByUrl('/')
  }

  /**
   * Check if any user is logged.
   */
  public isLoggedIn(): boolean {
    return localStorage.getItem(this.BROWSER_SESSION_KEY) !== null
  }

  /**
   * Get the data from the current logged user.
   */
  public getCurrentUser(): User {
    return JSON.parse(localStorage.getItem(this.BROWSER_SESSION_KEY))
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
