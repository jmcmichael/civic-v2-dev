import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GraphQLModule } from '@app/graphql/graphql.module';
import { civicIcons } from '@app/icons-provider.module';
import { ReactiveComponentModule } from '@ngrx/component';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CookieService } from 'ngx-cookie-service';
import { TimeagoFormatter, TimeagoModule } from 'ngx-timeago';
import { Observable } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CvcNetworkErrorAlertModule } from './components/app/network-error-alert/network-error-alert.module';
import { AppLoadErrorHandler } from './core/utilities/app-reload-handler';
import { CivicTimeagoFormatter } from './core/utilities/timeago-formatter';
import { CvcForms2Module } from './forms2/forms2.module';

registerLocaleData(en);

function initializeApiFactory(httpClient: HttpClient): () => Observable<any> {
  return () => httpClient.get("/api/status");
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    GraphQLModule,
    HttpClientModule,
    HttpClientXsrfModule,
    HttpClientJsonpModule,
    NzIconModule.forRoot(civicIcons),
    ReactiveComponentModule,
    TimeagoModule.forRoot({formatter: { provide: TimeagoFormatter, useClass: CivicTimeagoFormatter }}),
    CvcForms2Module,
    CvcNetworkErrorAlertModule,
  ],
  providers: [
    CookieService,
    {
      provide: ErrorHandler,
      useClass: AppLoadErrorHandler
    },
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApiFactory,
      deps: [HttpClient],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
