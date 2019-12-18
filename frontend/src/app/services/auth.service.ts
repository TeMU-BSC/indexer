// https://github.com/ArjunAranetaCodes/MoreCodes-Youtube/tree/master/angular-flask-mongodb-login-reg

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { User } from 'src/app/app.model'
import { baseUrl } from './api'


interface TokenResponse {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private http: HttpClient,
    private router: Router) { }

  /**
   * Save a new token in the browser
   */
  setToken(token: string): void {
    localStorage.setItem('userToken', token)
    // sessionStorage.setItem('userToken', token)
  }

  /**
   * Get the current stored token in the browser
   */
  getToken(): string {
    return localStorage.getItem('userToken')
    // return sessionStorage.getItem('userToken')
  }

  /**
   * Get the details of the current logged user
   */
  public getUserDetails() {
    const token = this.getToken()
    let payload
    if (token) {
      payload = token.split('.')[1]
      payload = window.atob(payload)
      return JSON.parse(payload)
    } else {
      return null
    }
  }

  /**
   * Check if a user is logged
   */
  public isLoggedIn(): boolean {
    const user = this.getUserDetails()
    if (user) {
      return user.exp > Date.now() / 1000
    } else {
      return false
    }
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
  public login(user: User): Observable<any> {
    const base = this.http.post(`${baseUrl}/user/login`, user)
    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.setToken(data.token)
        }
        return data
      })
    )
    return request
  }

  // profile(): Observable<any> {
  //   const options = {
  //     headers: { Authorization: `${this.getToken()}` }
  //   }
  //   return this.http.get('/users/profile', options)
  // }

  /**
   * Log out the current logged user
   */
  public logout(): void {
    localStorage.removeItem('userToken')
    // sessionStorage.removeItem('userToken')
    this.router.navigateByUrl('/')
  }

}
