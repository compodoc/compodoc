import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
class NotAuthGuard implements CanLoad {
    public canLoad() {
        return true;
    }
}
