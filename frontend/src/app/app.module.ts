import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

// Angular OAuth2
// import { OAuthModule } from 'angular-oauth2-oidc'

// Angular Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

// Angular HTTP
import { HttpClientModule } from '@angular/common/http'

// Angular Material
import { MaterialModule } from './material.module'

// Angular Flex-Layout
import { FlexLayoutModule } from '@angular/flex-layout'

// Simple Material Table
import { SimplemattableModule } from 'simplemattable'

// Own App Components
import { HeaderComponent } from './components/header/header.component'
import { LoginComponent } from './components/login/login.component'
import { ArticleComponent } from './components/article/article.component'
import { DescriptorsComponent } from './components/descriptors/descriptors.component'
import { HomeComponent } from './components/home/home.component'
import { HighlightPipe } from './pipes/highlight.pipe'
import { ProfileComponent } from './components/profile/profile.component'
import { AuthenticationService } from './services/auth.service'
import { AuthGuardService } from './services/auth-guard.service'
import { RegisterComponent } from './components/register/register.component'
import { ArticlesComponent } from './components/articles/articles.component'
import { ArticlesTableLikeComponent } from './components/articles-table-like/articles-table-like.component'
import { ArticlesTableComponent } from './components/articles-table/articles-table.component'
import { CdkDetailRowDirective } from './components/articles-table/cdk-detail-row.directive'
import { SlideToggleComponent } from './components/slide-toggle/slide-toggle.component';
import { FooterComponent } from './components/footer/footer.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    ArticleComponent,
    DescriptorsComponent,
    HomeComponent,
    HighlightPipe,
    ProfileComponent,
    RegisterComponent,
    ArticlesComponent,
    ArticlesTableLikeComponent,
    ArticlesTableComponent,
    CdkDetailRowDirective,
    SlideToggleComponent,
    FooterComponent
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
    ArticleComponent,
    SlideToggleComponent
  ],
  providers: [AuthenticationService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
