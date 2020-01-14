import { NgModule } from '@angular/core'

// Import the NgModule for each component you want to use:
import {
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatChipsModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSlideToggleModule,
  MatDialogModule,
  MatButtonToggleModule,
  MatMenuModule
} from '@angular/material'
import { MaterialFileInputModule } from 'ngx-material-file-input'

const material = [
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatTableModule,
  MatChipsModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatTabsModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatAutocompleteModule,
  MatSlideToggleModule,
  MaterialFileInputModule,
  MatDialogModule,
  MatButtonToggleModule,
  MatMenuModule
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
