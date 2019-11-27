import { NgModule } from '@angular/core'

// Import the NgModule for each component you want to use:
import {
  MatToolbarModule,
  MatIconModule,
  MatSidenavModule,
  MatListModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatBadgeModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatTabsModule,
  MatGridListModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatStepperModule,
  MatButtonToggleModule,
  MatAutocompleteModule,
  MatMenuModule,
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatRippleModule,
  MatSlideToggleModule,
} from '@angular/material'
import { MaterialFileInputModule } from 'ngx-material-file-input'

const material = [
  MatToolbarModule,
  MatIconModule,
  MatSidenavModule,
  MatListModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatBadgeModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MatExpansionModule,
  MatTabsModule,
  MatGridListModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatTooltipModule,
  MatStepperModule,
  MatButtonToggleModule,
  MatAutocompleteModule,
  MatMenuModule,
  MatRippleModule,
  MatSlideToggleModule,
  MaterialFileInputModule
]

@NgModule({
  declarations: [
  ],
  imports: material,
  exports: material,
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } }
  ],
  bootstrap: []
})
export class MaterialModule { }
