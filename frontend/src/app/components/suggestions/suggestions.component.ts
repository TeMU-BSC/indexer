import { Component, OnChanges, Input } from '@angular/core'
import { Doc, Descriptor } from 'src/app/models/decs'
import { DialogComponent } from '../dialog/dialog.component'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss']
})
export class SuggestionsComponent implements OnChanges {

  @Input() doc: Doc
  selectable = true
  removable = true
  chips = []
  options: Descriptor[]

  constructor(
    public api: ApiService,
    public auth: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Init the options
    this.options = this.api.allDescriptors
  }

  /**
   * This component implements OnChanges method so it can react to parent changes on its @Input() 'doc' property.
   */
  ngOnChanges() {
    // Update the chip lists
    this.chips = this.options.filter(descriptor => this.doc.suggestions.includes(descriptor.decsCode))
  }

  /**
   * Remove a chip from the chip list and send it to the backend to remove it from database.
   */
  removeChip(chip: Descriptor): void {
    // Remove chip from input field
    const index = this.chips.indexOf(chip)
    if (index >= 0) {
      this.chips.splice(index, 1)
    }
    // Build the object to sent to backend
    const annotationToRemove = {
      decsCode: chip.decsCode,
      user: this.auth.getCurrentUser().id,
      doc: this.doc.id
    }
    // Remove the annotation from database
    this.api.removeAnnotation(annotationToRemove).subscribe()
    // Visual information to the user
    const snackBarRef = this.snackBar.open(`DeCS borrado: ${chip.termSpanish} (${chip.decsCode})`, 'DESHACER')
    // If the action button is clicked, re-add the recently removed annotation
    snackBarRef.onAction().subscribe(() => {
      this.chips.push(chip)
      this.api.addAnnotation(annotationToRemove).subscribe()
    })
  }

  /**
   * Open a confirmation dialog to confirm the removal of a annotation from a document.
   */
  openConfirmDialog(chip: Descriptor): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: {
        title: '¿Quieres borrar esta anotación?',
        content: `${chip.termSpanish} (${chip.decsCode})`,
        no: 'Cancelar',
        yes: 'Borrar'
      }
    })
    dialogRef.afterClosed().subscribe(result => result ? this.removeChip(chip) : null)
  }

}
