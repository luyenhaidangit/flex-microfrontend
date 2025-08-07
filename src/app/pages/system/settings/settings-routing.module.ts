import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsComponent } from './settings.component';
import { AuthenticationComponent } from './authentication/authentication.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent
  },
  {
    path: 'authentication',
    component: AuthenticationComponent
  },
  {
    path: 'general',
    component: AuthenticationComponent // TODO: Create GeneralSettingsComponent
  },
  {
    path: 'email-rules',
    component: AuthenticationComponent // TODO: Create EmailRulesComponent
  },
  {
    path: 'languages',
    component: AuthenticationComponent // TODO: Create LanguagesComponent
  },
  {
    path: 'cache',
    component: AuthenticationComponent // TODO: Create CacheComponent
  },
  {
    path: 'optimize',
    component: AuthenticationComponent // TODO: Create OptimizeComponent
  },
  {
    path: 'email',
    component: AuthenticationComponent // TODO: Create EmailComponent
  },
  {
    path: 'media',
    component: AuthenticationComponent // TODO: Create MediaComponent
  },
  {
    path: 'admin-appearance',
    component: AuthenticationComponent // TODO: Create AdminAppearanceComponent
  },
  {
    path: 'datatables',
    component: AuthenticationComponent // TODO: Create DatatablesComponent
  },
  {
    path: 'sitemap',
    component: AuthenticationComponent // TODO: Create SitemapComponent
  },
  {
    path: 'email-templates',
    component: AuthenticationComponent // TODO: Create EmailTemplatesComponent
  },
  {
    path: 'permalink',
    component: AuthenticationComponent // TODO: Create PermalinkComponent
  },
  {
    path: 'api',
    component: AuthenticationComponent // TODO: Create ApiComponent
  },
  {
    path: 'tracking',
    component: AuthenticationComponent // TODO: Create TrackingComponent
  },
  {
    path: 'locales',
    component: AuthenticationComponent // TODO: Create LocalesComponent
  },
  {
    path: 'theme-translations',
    component: AuthenticationComponent // TODO: Create ThemeTranslationsComponent
  },
  {
    path: 'other-translations',
    component: AuthenticationComponent // TODO: Create OtherTranslationsComponent
  },
  {
    path: 'security',
    component: AuthenticationComponent // TODO: Create SecurityComponent
  },
  {
    path: 'user-management',
    component: AuthenticationComponent // TODO: Create UserManagementComponent
  },
  {
    path: 'ecommerce',
    children: [
      {
        path: 'general',
        component: AuthenticationComponent // TODO: Create EcommerceGeneralComponent
      },
      {
        path: 'currencies',
        component: AuthenticationComponent // TODO: Create CurrenciesComponent
      },
      {
        path: 'store-locators',
        component: AuthenticationComponent // TODO: Create StoreLocatorsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
