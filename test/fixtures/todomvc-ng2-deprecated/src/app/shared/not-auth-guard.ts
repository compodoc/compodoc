import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';

/**
 * @deprecated This guard is deprecated
 */
@Injectable({
    providedIn: 'root'
})
class NotAuthGuard implements CanLoad {
    public canLoad() {
        return true;
    }
}
