import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// https://angular.io/guide/http
import { HttpClientModule } from '@angular/common/http';

// https://material.angular.io/guide/getting-started
import { MaterialModule } from './material.module';

// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Own app components
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
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
