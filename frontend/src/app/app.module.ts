import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

// Angular Routing
import { AppRoutingModule } from './app-routing.module'
// Angular Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
// Angular HTTP
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
// Angular Material Design Styling
import { MaterialModule } from './material.module'
// Angular Flex-Layout
import { FlexLayoutModule } from '@angular/flex-layout'
// Simple Material Table: https://www.npmjs.com/package/simplemattable
import { SimplemattableModule } from 'simplemattable'
// Own App Components
import { AppComponent } from './app.component'
import { HeaderComponent } from './components/header/header.component'
import { FooterComponent } from './components/footer/footer.component'
import { HomeComponent } from './components/home/home.component'
import { AdminComponent } from './components/admin/admin.component'
import { LoginComponent } from './components/login/login.component'
import { DocsComponent } from './components/docs/docs.component'
import { DocComponent } from './components/doc/doc.component'
import { DescriptorsComponent } from './components/descriptors/descriptors.component'
import { DialogComponent } from './components/dialog/dialog.component'
import { HighlightPipe } from './pipes/highlight.pipe'
import { LoaderInterceptor } from './app.interceptor'


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    AdminComponent,
    LoginComponent,
    DocsComponent,
    DocComponent,
    DescriptorsComponent,
    DialogComponent,
    HighlightPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FlexLayoutModule,
    SimplemattableModule
  ],
  entryComponents: [
    LoginComponent,
    DialogComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
