import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AuthGuardService } from './services/auth-guard.service'
import { HomeComponent } from './components/home/home.component'
import { LoginComponent } from './components/login/login.component'
import { ProfileComponent } from './components/profile/profile.component'
import { AdminComponent } from './components/admin/admin.component'
import { DocsComponent } from './components/docs/docs.component'

// https://medium.com/@philip_lysenko/initial-auth-with-angular-oauth2-a8740efe9264
// const lazyPathValue = 'lazy'
// export const LAZY_PATH = new InjectionToken('LAZY_PATH')


const routes: Routes = [
  { path: 'docs', component: DocsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  // { path: 'profile', component: ProfileComponent, canActivate: [AuthGuardService] }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // providers: [{ provide: LAZY_PATH, useValue: lazyPathValue }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
