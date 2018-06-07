import { CanActivate } from '@angular/router';

class AuthGuard implements CanActivate {

    public canActivate () {
        return true;
    }

}