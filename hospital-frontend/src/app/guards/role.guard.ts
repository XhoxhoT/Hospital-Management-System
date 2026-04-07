import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const currentUser = this.authService.currentUserValue;
    const requiredRoles = route.data['roles'] as UserRole[];

    if (!currentUser) {
      // Not logged in, redirect to login
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
      // User doesn't have required role, redirect to their dashboard
      this.redirectToDashboard(currentUser.role);
      return false;
    }

    return true;
  }

  private redirectToDashboard(role: UserRole): void {
    this.router.navigate(['/dashboard']);
  }
}
