import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { HomeComponent } from './components/home/home.component'
import { AdminComponent } from './components/admin/admin.component'
import { DocsComponent } from './components/docs/docs.component'
import { AuthService } from './services/auth.service'
import { AuthAdminService } from './services/auth-admin.service'
import { DocDetailComponent } from './components/doc-detail/doc-detail.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'doc/:id', component: DocDetailComponent, canActivate: [AuthService] },
  { path: 'docs', component: DocsComponent, canActivate: [AuthService] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthService, AuthAdminService] },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
