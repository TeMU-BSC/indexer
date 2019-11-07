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

// Typeahead
import { NgxTypeaheadModule } from 'ngx-typeahead'

// Own App Components
import { HeaderComponent } from './components/header/header.component'
import { LoginComponent } from './components/login/login.component'
import { AutocompleteAsyncComponent } from './components/autocomplete-async/autocomplete-async.component'
import { ArticleComponent } from './components/article/article.component'
import { DescriptorsComponent } from './components/descriptors/descriptors.component'
import { MainComponent } from './components/main/main.component';
import { BulkEditComponent } from './components/bulk-edit/bulk-edit.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    AutocompleteAsyncComponent,
    ArticleComponent,
    DescriptorsComponent,
    MainComponent,
    BulkEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    NgxTypeaheadModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
