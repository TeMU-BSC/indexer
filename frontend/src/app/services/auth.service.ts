// https://github.com/ArjunAranetaCodes/MoreCodes-Youtube/tree/master/angular-flask-mongodb-login-reg

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router'
import { map } from 'rxjs/operators'
import { Observable } from 'rxjs'

import { User } from 'src/app/app.model'
import { HOSTNAME, PORT } from './api'


interface TokenResponse {
  token: string
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // ip = 'localhost'
  // ip = '84.88.53.221'
  // ip = 'myapp.local'
  // ip = 'temu.bsc.es'
  // ip = 'bsccnio01.bsc.es'

  // port = '5000'
  // port = '8080'

  constructor(
    private http: HttpClient,
    private router: Router) { }

  setToken(token: string): void {
    localStorage.setItem('userToken', token)
    // sessionStorage.setItem('userToken', token)
  }

  getToken(): string {
    return localStorage.getItem('userToken')
    // return sessionStorage.getItem('userToken')
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

  // public registerOne(user: User): Observable<any> {
  //   return this.http.post<User>(`/user/register/one`, user)
  //   return this.http.post<User>(`http://${HOSTNAME}:${PORT}/user/register/one`, user)
  // }

  public registerMany(users: User[]): Observable<any> {
    // return this.http.post<any>(`/user/register/many`, users)
    return this.http.post<any>(`http://${HOSTNAME}:${PORT}/user/register/many`, users)
  }

  public login(user: User): Observable<any> {
    // return this.http.post<User>(`http://${HOSTNAME}:${PORT}/user/login`, user)

    const base = this.http.post(`http://${HOSTNAME}:${PORT}/user/login`, user)
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

  public logout(): void {
    localStorage.removeItem('userToken')
    // sessionStorage.removeItem('userToken')
    this.router.navigateByUrl('/')
  }

}
