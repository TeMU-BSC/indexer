import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AuthGuardService } from './services/auth-guard.service'
import { HomeComponent } from './components/home/home.component'
import { AdminComponent } from './components/admin/admin.component'
import { DocsComponent } from './components/docs/docs.component'


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'docs', component: DocsComponent, canActivate: [AuthGuardService] }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  // providers: [{ provide: LAZY_PATH, useValue: lazyPathValue }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
