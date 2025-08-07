import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface SettingItem {
  icon: string;
  title: string;
  description: string;
  route: string;
  category: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  
  settings: SettingItem[] = [
    // Common Section
    {
      icon: 'bx bx-cog',
      title: 'General',
      description: 'View and update your general settings and activate license',
      route: '/system/settings/general',
      category: 'common'
    },
    {
      icon: 'bx bx-envelope-check',
      title: 'Email rules',
      description: 'Configure email rules for validation',
      route: '/system/settings/email-rules',
      category: 'common'
    },
    {
      icon: 'bx bx-font',
      title: 'Languages',
      description: 'View and update your website languages',
      route: '/system/settings/languages',
      category: 'common'
    },
    {
      icon: 'bx bx-box',
      title: 'Cache',
      description: 'Configure caching for optimized speed',
      route: '/system/settings/cache',
      category: 'common'
    },
    {
      icon: 'bx bx-help-circle',
      title: 'Optimize',
      description: 'Minify HTML output, inline CSS, remove comments...',
      route: '/system/settings/optimize',
      category: 'common'
    },
    {
      icon: 'bx bx-envelope',
      title: 'Email',
      description: 'View and update your email settings and email templates',
      route: '/system/settings/email',
      category: 'common'
    },
    {
      icon: 'bx bx-folder',
      title: 'Media',
      description: 'View and update your media settings',
      route: '/system/settings/media',
      category: 'common'
    },
    {
      icon: 'bx bx-user',
      title: 'Admin appearance',
      description: 'View and update logo, favicon, layout,...',
      route: '/system/settings/admin-appearance',
      category: 'common'
    },
    {
      icon: 'bx bx-grid',
      title: 'Datatables',
      description: 'Settings for datatables',
      route: '/system/settings/datatables',
      category: 'common'
    },
    {
      icon: 'bx bx-link',
      title: 'Sitemap',
      description: 'Manage sitemap configuration',
      route: '/system/settings/sitemap',
      category: 'common'
    },
    {
      icon: 'bx bx-envelope-open',
      title: 'Email templates',
      description: 'Email templates using HTML & system variables.',
      route: '/system/settings/email-templates',
      category: 'common'
    },
    {
      icon: 'bx bx-link-alt',
      title: 'Permalink',
      description: 'View and update your permalink settings',
      route: '/system/settings/permalink',
      category: 'common'
    },
    {
      icon: 'bx bx-api',
      title: 'API Settings',
      description: 'View and update your API settings',
      route: '/system/settings/api',
      category: 'common'
    },
    {
      icon: 'bx bx-globe',
      title: 'Website Tracking',
      description: 'Configure website tracking',
      route: '/system/settings/tracking',
      category: 'common'
    },
    
    // Localization Section
    {
      icon: 'bx bx-globe',
      title: 'Locales',
      description: 'View, download and import locales',
      route: '/system/settings/locales',
      category: 'localization'
    },
    {
      icon: 'bx bx-font',
      title: 'Theme Translations',
      description: 'Manage the theme translations',
      route: '/system/settings/theme-translations',
      category: 'localization'
    },
    {
      icon: 'bx bx-message-square-detail',
      title: 'Other Translations',
      description: 'Manage the other translations (admin, plugins, packages...)',
      route: '/system/settings/other-translations',
      category: 'localization'
    },
    
    // Authentication Section
    {
      icon: 'bx bx-shield-check',
      title: 'Authentication',
      description: 'Configure authentication modes and database settings',
      route: '/system/settings/authentication',
      category: 'authentication'
    },
    {
      icon: 'bx bx-lock',
      title: 'Security',
      description: 'Manage security settings and access controls',
      route: '/system/settings/security',
      category: 'authentication'
    },
    {
      icon: 'bx bx-user-check',
      title: 'User Management',
      description: 'Configure user registration and management settings',
      route: '/system/settings/user-management',
      category: 'authentication'
    },
    
    // Ecommerce Section
    {
      icon: 'bx bx-cog',
      title: 'General',
      description: 'Configure general ecommerce settings',
      route: '/system/settings/ecommerce/general',
      category: 'ecommerce'
    },
    {
      icon: 'bx bx-dollar-circle',
      title: 'Currencies',
      description: 'Manage currency settings and exchange rates',
      route: '/system/settings/ecommerce/currencies',
      category: 'ecommerce'
    },
    {
      icon: 'bx bx-map-pin',
      title: 'Store locators',
      description: 'Configure store location settings',
      route: '/system/settings/ecommerce/store-locators',
      category: 'ecommerce'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  getSettingsByCategory(category: string): SettingItem[] {
    return this.settings.filter(item => item.category === category);
  }

  navigateToSetting(route: string): void {
    this.router.navigate([route]);
  }
}
