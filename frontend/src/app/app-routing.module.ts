import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AuthGuardService } from './services/auth-guard.service'
import { HomeComponent } from './components/home/home.component'
import { RegisterComponent } from './components/register/register.component'
import { LoginComponent } from './components/login/login.component'
import { ProfileComponent } from './components/profile/profile.component'

// https://medium.com/@philip_lysenko/initial-auth-with-angular-oauth2-a8740efe9264
// const lazyPathValue = 'lazy'
// export const LAZY_PATH = new InjectionToken('LAZY_PATH')


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // providers: [{ provide: LAZY_PATH, useValue: lazyPathValue }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
