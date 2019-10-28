import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular HTTP
import { HttpClientModule } from '@angular/common/http';

// Angular Material
import { MaterialModule } from './material.module';

// Angular Flex-Layout
import { FlexLayoutModule } from '@angular/flex-layout';

// Autocomplete https://www.npmjs.com/package/angular-ng-autocomplete
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

// Own App Components
import { IndexerComponent } from './indexer/indexer.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexerComponent
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
    AutocompleteLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
