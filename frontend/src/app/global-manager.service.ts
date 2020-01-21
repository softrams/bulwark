import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalManagerService {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    null
  );
  public loggedIn$: Observable<boolean> = this.loggedIn.asObservable();

  constructor() {}

  showLogin(ifShow: boolean) {
    this.loggedIn.next(ifShow);
  }
}
