import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NetworkErrorsService {
  public networkError$: BehaviorSubject<any>;
  constructor() {
    this.networkError$ = new BehaviorSubject<any>(undefined);
  }

  clearErrors(): void {
    this.networkError$.next(undefined);
  }
}
