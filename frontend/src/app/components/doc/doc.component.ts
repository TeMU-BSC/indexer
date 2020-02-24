import { Component, Input, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { DescriptorsComponent } from 'src/app/components/descriptors/descriptors.component'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { Doc } from 'src/app/models/decs'
import { FormConfig } from 'src/app/models/form'
import { ApiService } from 'src/app/services/api.service'
import { AuthService } from 'src/app/services/auth.service'
import { MatSlideToggle } from '@angular/material/slide-toggle'

@Component({
  selector: 'app-doc',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss']
})
export class DocComponent implements AfterViewInit {

  @Input() doc: Doc
  @ViewChild('completeToggle') completeToggle: MatSlideToggle
  @ViewChild('validateToggle') validateToggle: MatSlideToggle
  @ViewChild('validations') validations: DescriptorsComponent
  @Output() decsChange = new EventEmitter<boolean>()
  @Output() completed = new EventEmitter<boolean>()
  @Output() validated = new EventEmitter<boolean>()
  formConfigDescriptors: FormConfig = {
    label: 'Descriptores añadidos por ti inicialmente',
    hint: `Se puede buscar un descriptor por su término en español, término en inglés, número de registro (DeCS),
    código MeSH análogo o alguno de sus sinónimos aceptados.`,
    buttonName: 'Completado',
    color: 'accent',
    action: 'complete'
  }
  formConfigValidations = {
    label: 'Descriptores añadidos por ti y por otros indizadores',
    hint: `Acepta las sugerencias de otros indizadores dejando el descriptor en esta lista, o bien recházalas
    eliminándolas. También puedes añadir descriptores adicionales.`,
    buttonName: 'Validado',
    color: 'primary',
    action: 'validate'
  }

  constructor(
    public api: ApiService,
    private auth: AuthService,
    public dialog: MatDialog,
  ) { }

  ngAfterViewInit() { }

  /**
   * Open a confirmation dialog before mark a document as completed/validated and apply changes to backend.
   */
  confirmDialogBeforeMark(action: string): void {
    let title: string
    let content: string
    let buttonName: string
    let color: string
    switch (action) {
      case 'complete':
        title = 'Esta acción no se puede revertir.'
        content = '¿Quieres marcar este documento como completado?'
        buttonName = 'Completar'
        color = 'accent'
        break
      case 'validate':
        title = 'Esta acción no se puede revertir.'
        content = '¿Quieres marcar este documento como validado?'
        buttonName = 'Validar'
        color = 'primary'
        break
    }
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title,
        content,
        cancel: 'Cancelar',
        buttonName,
        color
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (!confirmation) {
        switch (action) {
          case 'complete':
            this.completeToggle.checked = false
            break
          case 'validate':
            this.validateToggle.checked = false
            break
        }
      }
      if (confirmation) {
        switch (action) {
          case 'complete':
            this.doc.completed = true
            this.completed.emit(true)
            this.api.markAsCompleted({ doc: this.doc.id, user: this.auth.getCurrentUser().id }).subscribe()
            break
          case 'validate':
            this.doc.validated = true
            this.validated.emit(true)
            this.api.markAsValidated({ doc: this.doc.id, user: this.auth.getCurrentUser().id }).subscribe()
            const validatedAnnotations = []
            this.validations.chips.forEach(chip => {
              validatedAnnotations.push({
                decsCode: chip.decsCode,
                user: this.auth.getCurrentUser().id,
                doc: this.doc.id,
              })
            })
            this.api.saveValidatedAnnotations(validatedAnnotations).subscribe()
            break
        }
      }
    })
  }

  emitEvent() {
    this.decsChange.emit(true)
  }

}
