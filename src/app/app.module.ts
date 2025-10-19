import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { CarouselModule } from 'ngx-owl-carousel-o';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

import { SharedModule } from './cyptolanding/shared/shared.module';

import { ExtrapagesModule } from './extrapages/extrapages.module';

import { LayoutsModule } from './layouts/layouts.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CyptolandingComponent } from './cyptolanding/cyptolanding.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppHttpInterceptor } from './core/interceptors/http.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { AngularToastifyModule } from 'angular-toastify';
import { AppInitializerService } from './core/services/app-initializer.service';

export function initFactory(initService: AppInitializerService) {
  return () => initService.init();
}

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, environment.externalService.translateServiceUrl, '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    CyptolandingComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    LayoutsModule,
    AppRoutingModule,
    ExtrapagesModule,
    CarouselModule,
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    SharedModule,
    ScrollToModule.forRoot(),
    ToastrModule.forRoot(),
    AngularToastifyModule
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initFactory, deps: [AppInitializerService], multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true },
  ],
})
export class AppModule { }
