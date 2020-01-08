// https://github.com/ArjunAranetaCodes/MoreCodes-Youtube/tree/master/angular-flask-mongodb-login-reg

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'

import { User } from 'src/app/app.model'
import { baseUrl } from './api'


interface TokenResponse {
  user: User
  token?: string
  error?: string
  result?: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  SESSION_APPLICATION_KEY = 'userToken'
  public user: User

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Check if any user is logged
   */
  public isLoggedIn(): boolean {
    return localStorage.getItem(this.SESSION_APPLICATION_KEY) !== null
  }

  public getCurrentUser(): User {
    return JSON.parse(localStorage.getItem(this.SESSION_APPLICATION_KEY))
  }

  /**
   * Register one new user
   */
  // public registerOne(user: User): Observable<any> {
  //   return this.http.post<User>(`${baseUrl}/user/register/one`, user)
  // }

  /**
   * Register many new users
   */
  public registerMany(users: User[]): Observable<any> {
    return this.http.post<any>(`${baseUrl}/user/register/many`, users)
  }

  /**
   * Log in an existing user
   */
  public login(user: User): void {
    this.http.post(`${baseUrl}/user/login`, user).subscribe(
      (response: TokenResponse) => {
        if (response.token) {
          this.user = response.user
          localStorage.setItem(this.SESSION_APPLICATION_KEY, JSON.stringify(this.user))
        }
        if (response.error) {
          alert(response.error)
        }
        if (response.result) {
          alert(response.result)
        }
      },
      error => console.log(error),
      () => this.router.navigateByUrl('/docs')
    )
  }

  /**
   * Log out the current logged user
   */
  public logout(): void {
    localStorage.removeItem(this.SESSION_APPLICATION_KEY)
    this.router.navigateByUrl('/')
  }

}
