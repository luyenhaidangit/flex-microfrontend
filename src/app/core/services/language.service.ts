import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  public languages: string[] = ['vn', 'en', 'es', 'de', 'it', 'ru'];

  constructor(public translate: TranslateService, private cookieService: CookieService) {
    const defaultLang = 'vn';
    this.translate.addLangs(this.languages);
    let browserLang = defaultLang;
    if (this.cookieService.check('lang')) {
      browserLang = this.cookieService.get('lang');
    }
    this.translate.use(this.languages.includes(browserLang) ? browserLang : defaultLang);
    this.cookieService.set('lang', browserLang);
  }

  public setLanguage(lang) {
    this.translate.use(lang);
    this.cookieService.set('lang', lang);
  }
}
