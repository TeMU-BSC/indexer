import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { AppRoutingModule } from './app-routing.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

// npm third-party libraries
import { FlexLayoutModule } from '@angular/flex-layout'
import { MaterialModule } from './styling/material.module'
import { SimplemattableModule } from 'simplemattable'

// Created components, pipes, interceptors
import { AppComponent } from './app.component'
import { HeaderComponent } from './components/header/header.component'
import { FooterComponent } from './components/footer/footer.component'
import { HomeComponent } from './components/home/home.component'
import { AdminComponent } from './components/admin/admin.component'
import { LoginComponent } from './components/login/login.component'
import { DialogComponent } from './components/dialog/dialog.component'
import { DocsComponent } from './components/docs/docs.component'
import { DocComponent } from './components/doc/doc.component'
import { TermsComponent } from './components/terms/terms.component'
import { DocDetailComponent } from './components/doc-detail/doc-detail.component'
import { HighlightPipe } from './pipes/highlight.pipe'
import { SafeHtmlPipe } from './pipes/safe-html.pipe'


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AdminComponent,
    LoginComponent,
    DialogComponent,
    DocsComponent,
    DocComponent,
    TermsComponent,
    DocDetailComponent,
    HighlightPipe,
    SafeHtmlPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    SimplemattableModule,
    HttpClientModule,
  ],
  providers: [
    HighlightPipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
