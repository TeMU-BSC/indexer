// https://github.com/ArjunAranetaCodes/MoreCodes-Youtube/tree/master/angular-flask-mongodb-login-reg

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { map } from 'rxjs/operators'
import { User } from 'src/app/app.model'
import { Observable } from 'rxjs'

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

  setToken(token: string): void {
    sessionStorage.setItem('userToken', token)
  }

  getToken(): string {
    return sessionStorage.getItem('userToken')
  }

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

  public isLoggedIn(): boolean {
    const user = this.getUserDetails()
    if (user) {
      return user.exp > Date.now() / 1000
    } else {
      return false
    }
  }

  public registerOne(user: User): Observable<any> {
    return this.http.post<User>('/users/register/one', user)
  }

  public registerMany(users: User[]): Observable<any> {
    return this.http.post<any>('/users/register/many', users)
  }

  public login(user: User): Observable<any> {
    const base = this.http.post('/users/login', user)
    const request = base.pipe(
      map((data: TokenResponse) => {
        if (data.token) {
          this.setToken(data.token)
        }
        return data
      })
    )
    return request

    // return this.http.post<User>('/users/login', user)
  }

  // profile(): Observable<any> {
  //   const options = {
  //     headers: { Authorization: `${this.getToken()}` }
  //   }
  //   return this.http.get('/users/profile', options)
  // }

  public logout(): void {
    sessionStorage.removeItem('userToken')
    this.router.navigateByUrl('/')
  }

}
