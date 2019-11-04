import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

// Angular Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

// Angular HTTP
import { HttpClientModule } from '@angular/common/http'

// Angular Material
import { MaterialModule } from './material.module'

// Angular Flex-Layout
import { FlexLayoutModule } from '@angular/flex-layout'

// Own App Components
import { IndexerComponent } from './components/indexer/indexer.component'
import { LoginComponent } from './components/login/login.component'
import { HeaderComponent } from './components/header/header.component';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { DynamicFieldsComponent } from './components/dynamic-fields/dynamic-fields.component'

@NgModule({
  declarations: [
    AppComponent,
    IndexerComponent,
    LoginComponent,
    HeaderComponent,
    DynamicFormComponent,
    DynamicFieldsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
