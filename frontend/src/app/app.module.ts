import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { AppRoutingModule } from './app-routing.module'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

// npm third-party libraries
import { FlexLayoutModule } from '@angular/flex-layout'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
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
import { LoaderInterceptor } from './interceptors/loader.interceptor'
import { DocsComponent } from './components/docs/docs.component'
import { DocComponent } from './components/doc/doc.component'
import { DescriptorsComponent } from './components/descriptors/descriptors.component'
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
    DescriptorsComponent,
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
    FontAwesomeModule,
    FlexLayoutModule,
    SimplemattableModule,
    HttpClientModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    HighlightPipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
