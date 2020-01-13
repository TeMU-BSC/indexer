import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Descriptor } from 'src/app/app.model'


@Component({
  selector: 'app-confirm',
  templateUrl: 'confirm.component.html',
})
export class ConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Descriptor
  ) { }

  onNoClick(): void {
    this.dialogRef.close()
  }

}
