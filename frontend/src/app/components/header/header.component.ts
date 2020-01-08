import { Component, Inject } from '@angular/core'
import { AuthenticationService } from 'src/app/services/auth.service'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { User } from 'src/app/app.model'
import { Router } from '@angular/router'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  user: User

  constructor(
    public auth: AuthenticationService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  public openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '300px',
      data: { user: this.user }
    })

    dialogRef.afterClosed().subscribe(result => {
      this.user = result
      this.auth.login(this.user)
    })
  }

}

@Component({
  selector: 'app-login-dialog',
  templateUrl: 'login-dialog.html',
})
export class LoginDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) { }

  onNoClick(): void {
    this.dialogRef.close()
  }

}
