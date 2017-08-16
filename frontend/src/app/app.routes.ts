import { NgModule } from '@angular/core';
import { PreloadingStrategy, RouterModule, Route, Routes } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './user/profile/profile.component';
import { LoginComponent } from './user/login/login.component';
import { SignupComponent } from './user/signup/signup.component';
import { AuthenticatedGuard } from './user/authenticated.guard';
import { UnauthenticatedGuard } from './user/unauthenticated.guard';

const APP_ROUTES: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [AuthenticatedGuard] },
    { path: 'login', component: LoginComponent, canActivate: [UnauthenticatedGuard] },
    { path: 'signup', component: SignupComponent, canActivate: [UnauthenticatedGuard] },
    { path: '**', redirectTo: 'home' }
];

export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: Function): Observable<any> {
    return route.data && route.data['preload'] ? load() : Observable.of(null);
  }
}

@NgModule({
  imports: [
    RouterModule.forRoot(APP_ROUTES, {
      preloadingStrategy: CustomPreloadingStrategy
    })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CustomPreloadingStrategy
  ]
})
export class AppRoutingModule {}
