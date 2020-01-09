// https://github.com/ArjunAranetaCodes/MoreCodes-Youtube/tree/master/angular-flask-mongodb-login-reg

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { User, ApiResponse } from 'src/app/app.model'
import { environment } from 'src/environments/environment'


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  BROWSER_SESSION_KEY = 'userObject'
  public user: User

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Check if any user is logged
   */
  public isLoggedIn(): boolean {
    return localStorage.getItem(this.BROWSER_SESSION_KEY) !== null
  }

  public getCurrentUser(): User {
    return JSON.parse(localStorage.getItem(this.BROWSER_SESSION_KEY))
  }

  /**
   * Register one new user
   */
  // public registerOne(user: User): Observable<any> {
  //   return this.http.post<User>(`${environment.apiUrl}/user/register/one`, user)
  // }

  /**
   * Register many new users
   */
  public registerMany(users: User[]): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/user/register/many`, users)
  }

  /**
   * Log in an existing user
   */
  public login(user: User): void {
    this.http.post(`${environment.apiUrl}/user/login`, user).subscribe(
      (response: ApiResponse) => {
        if (response.user) {
          this.user = response.user
          localStorage.setItem(this.BROWSER_SESSION_KEY, JSON.stringify(this.user))
        }
        if (response.error) {
          alert(response.error)
        }
        if (response.result) {
          alert(response.result)
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

}
