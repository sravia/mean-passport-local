import { Component, OnDestroy } from '@angular/core';

import { AuthService } from './../auth.service';
import { User } from './../user';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy {
  public username: string;
  public password: string;

  constructor(public authService: AuthService) {}

  public login(): void {
    this.authService.login(this.username, this.password);
  }

  ngOnDestroy() {
    this.authService.error = null;
  }
}
