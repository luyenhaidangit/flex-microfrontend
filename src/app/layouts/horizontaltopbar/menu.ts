import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 2,
                label: 'MENUITEMS.DASHBOARDS.LIST.DEFAULT',
                link: '/dashboard',
                parentId: 1
            },
            {
                id: 3,
                label: 'MENUITEMS.DASHBOARDS.LIST.SAAS',
                link: '/dashboards/saas',
                parentId: 1
            },
            {
                id: 4,
                label: 'MENUITEMS.DASHBOARDS.LIST.CRYPTO',
                link: '/dashboards/crypto',
                parentId: 1
            },
            {
                id: 5,
                label: 'MENUITEMS.DASHBOARDS.LIST.BLOG',
                link: '/dashboards/blog',
                parentId: 1
            },
            {
                id: 6,
                label: 'MENUITEMS.DASHBOARDS.LIST.JOBS',
                link: '/dashboards/jobs',
                parentId: 1,
            },
        ]
    },
    {
        id: 7,
        label: 'MENUITEMS.UIELEMENTS.TEXT',
        icon: 'bx-tone',
        isUiElement: true,
        subItems: [
            {
                id: 8,
                label: 'MENUITEMS.UIELEMENTS.LIST.ALERTS',
                link: '/ui/alerts',
                parentId: 7
            },
            {
                id: 9,
                label: 'MENUITEMS.UIELEMENTS.LIST.MODALS',
                link: '/ui/modals',
                parentId: 7
            },
            {
                id: 10,
                label: 'MENUITEMS.UIELEMENTS.LIST.TYPOGRAPHY',
                link: '/ui/typography',
                parentId: 7
            },
            {
                id: 11,
                label: 'MENUITEMS.UIELEMENTS.LIST.BUTTONS',
                link: '/ui/buttons',
                parentId: 7
            },
            {
                id: 12,
                label: 'MENUITEMS.UIELEMENTS.LIST.TOASTS',
                link: '/ui/toasts',
                parentId: 7
            },
            {
                id: 13,
                label: 'MENUITEMS.UIELEMENTS.LIST.CARDS',
                link: '/ui/cards',
                parentId: 7
            },
            {
                id: 14,
                label: 'MENUITEMS.UIELEMENTS.LIST.RANGESLIDER',
                link: '/ui/rangeslider',
                parentId: 7
            },
            {
                id: 15,
                label: 'MENUITEMS.UIELEMENTS.LIST.VIDEO',
                link: '/ui/video',
                parentId: 7
            },
            {
                id: 16,
                label: 'MENUITEMS.UIELEMENTS.LIST.CAROUSEL',
                link: '/ui/carousel',
                parentId: 7
            },
            {
                id: 17,
                label: 'MENUITEMS.UIELEMENTS.LIST.GENERAL',
                link: '/ui/general',
                parentId: 7
            },
            {
                id: 18,
                label: 'MENUITEMS.UIELEMENTS.LIST.DROPDOWNS',
                link: '/ui/dropdowns',
                parentId: 7
            },
            {
                id: 19,
                label: 'MENUITEMS.UIELEMENTS.LIST.PROGRESSBAR',
                link: '/ui/progressbar',
                parentId: 7
            },
            {
                id: 20,
                label: 'MENUITEMS.UIELEMENTS.LIST.COLORS',
                link: '/ui/colors',
                parentId: 7
            },
            {
                id: 21,
                label: 'MENUITEMS.UIELEMENTS.LIST.GRID',
                link: '/ui/grid',
                parentId: 7
            },
            {
                id: 22,
                label: 'MENUITEMS.UIELEMENTS.LIST.PLACEHOLDER',
                link: '/ui/placeholder',
                parentId: 7
            },
            {
                id: 23,
                label: 'MENUITEMS.UIELEMENTS.LIST.RATING',
                link: '/ui/rating',
                parentId: 7
            },
            {
                id: 24,
                label: 'MENUITEMS.UIELEMENTS.LIST.IMAGES',
                link: '/ui/images',
                parentId: 7
            },
            {
                id: 25,
                label: 'MENUITEMS.UIELEMENTS.LIST.SWEETALERT',
                link: '/ui/sweet-alert',
                parentId: 7
            },
            {
                id: 26,
                label: 'MENUITEMS.UIELEMENTS.LIST.NOTIFICATION',
                link: '/ui/notification',
                parentId: 7
            },
            {
                id: 27,
                label: 'MENUITEMS.UIELEMENTS.LIST.LIGHTBOX',
                link: '/ui/lightbox',
                parentId: 7
            },
            {
                id: 28,
                label: 'MENUITEMS.UIELEMENTS.LIST.TABS',
                link: '/ui/tabs-accordions',
                parentId: 7
            },
            
            {
                id: 29,
                label: 'MENUITEMS.UIELEMENTS.LIST.CROPPER',
                link: '/ui/image-crop',
                parentId: 7
            },
        ]
    },
    {
        id: 30,
        label: 'MENUITEMS.APPS.TEXT',
        icon: 'bx-customize',
        subItems: [
            {
                id: 31,
                label: 'MENUITEMS.CALENDAR.TEXT',
                link: '/calendar',
                parentId: 30
            },
            {
                id: 32,
                label: 'MENUITEMS.CHAT.TEXT',
                link: '/chat',
                parentId: 30
            },
            {
                id: 33,
                label: 'MENUITEMS.FILEMANAGER.TEXT',
                link: '/filemanager',
                parentId: 30
            },
            {
                id: 34,
                label: 'MENUITEMS.EMAIL.TEXT',
                subItems: [
                    {
                        id: 35,
                        label: 'MENUITEMS.EMAIL.LIST.INBOX',
                        link: '/email/inbox',
                        parentId: 34
                    },
                    {
                        id: 36,
                        label: 'MENUITEMS.EMAIL.LIST.READEMAIL',
                        link: '/email/read',
                        parentId: 34
                    },
                    {
                        id: 37,
                        label: 'MENUITEMS.EMAIL.LIST.TEMPLATE.TEXT',
                        parentId: 34,
                        subItems: [
                            {
                                id:38 ,
                                label: 'MENUITEMS.EMAIL.LIST.TEMPLATE.LIST.BASIC',
                                link: '/email/basic',
                                parentId:37
                            },
                            {
                                id:39,
                                label: 'MENUITEMS.EMAIL.LIST.TEMPLATE.LIST.ALERT',
                                link: '/email/alert',
                                parentId:37
                            },
                            {
                                id:40,
                                label: 'MENUITEMS.EMAIL.LIST.TEMPLATE.LIST.BILLING',
                                link: '/email/billing',
                                parentId:37
                            }
                        ]
                    }
                ]
            },
            {
                id: 41,
                label: 'MENUITEMS.ECOMMERCE.TEXT',
                subItems: [
                    {
                        id: 42,
                        label: 'MENUITEMS.ECOMMERCE.LIST.PRODUCTS',
                        link: '/ecommerce/products',
                        parentId: 41
                    },
                    {
                        id: 43,
                        label: 'MENUITEMS.ECOMMERCE.LIST.PRODUCTDETAIL',
                        link: '/ecommerce/product-detail/1',
                        parentId: 41
                    },
                    {
                        id: 44,
                        label: 'MENUITEMS.ECOMMERCE.LIST.ORDERS',
                        link: '/ecommerce/orders',
                        parentId: 41
                    },
                    {
                        id: 45,
                        label: 'MENUITEMS.ECOMMERCE.LIST.CUSTOMERS',
                        link: '/ecommerce/customers',
                        parentId: 41
                    },
                    {
                        id: 46,
                        label: 'MENUITEMS.ECOMMERCE.LIST.CART',
                        link: '/ecommerce/cart',
                        parentId: 41
                    },
                    {
                        id: 47,
                        label: 'MENUITEMS.ECOMMERCE.LIST.CHECKOUT',
                        link: '/ecommerce/checkout',
                        parentId: 41
                    },
                    {
                        id: 48,
                        label: 'MENUITEMS.ECOMMERCE.LIST.SHOPS',
                        link: '/ecommerce/shops',
                        parentId: 41
                    },
                    {
                        id: 49,
                        label: 'MENUITEMS.ECOMMERCE.LIST.ADDPRODUCT',
                        link: '/ecommerce/add-product',
                        parentId: 41
                    },
                ]
            },
            {
                id: 50,
                label: 'MENUITEMS.CRYPTO.TEXT',
                icon: 'bx-bitcoin',
                subItems: [
                    {
                        id: 51,
                        label: 'MENUITEMS.CRYPTO.LIST.WALLET',
                        link: '/crypto/wallet',
                        parentId: 50
                    },
                    {
                        id: 52,
                        label: 'MENUITEMS.CRYPTO.LIST.BUY/SELL',
                        link: '/crypto/buy-sell',
                        parentId: 50
                    },
                    {
                        id: 53,
                        label: 'MENUITEMS.CRYPTO.LIST.EXCHANGE',
                        link: '/crypto/exchange',
                        parentId: 50
                    },
                    {
                        id: 54,
                        label: 'MENUITEMS.CRYPTO.LIST.LENDING',
                        link: '/crypto/lending',
                        parentId: 50
                    },
                    {
                        id: 55,
                        label: 'MENUITEMS.CRYPTO.LIST.ORDERS',
                        link: '/crypto/orders',
                        parentId: 50
                    },
                    {
                        id: 56,
                        label: 'MENUITEMS.CRYPTO.LIST.KYCAPPLICATION',
                        link: '/crypto/kyc-application',
                        parentId: 50
                    },
                    {
                        id: 57,
                        label: 'MENUITEMS.CRYPTO.LIST.ICOLANDING',
                        link: '/crypto-ico-landing',
                        parentd: 50
                    }
                ]
            },
            {
                id: 58,
                label: 'MENUITEMS.PROJECTS.TEXT',
                subItems: [
                    {
                        id: 59,
                        label: 'MENUITEMS.PROJECTS.LIST.GRID',
                        link: '/projects/grid',
                        parentId: 58
                    },
                    {
                        id: 60,
                        label: 'MENUITEMS.PROJECTS.LIST.PROJECTLIST',
                        link: '/projects/list',
                        parentId: 58
                    },
                    {
                        id: 61,
                        label: 'MENUITEMS.PROJECTS.LIST.OVERVIEW',
                        link: '/projects/overview',
                        parentId: 58
                    },
                    {
                        id: 62,
                        label: 'MENUITEMS.PROJECTS.LIST.CREATE',
                        link: '/projects/create',
                        parentId: 58
                    }
                ]
            },
            {
                id: 63,
                label: 'MENUITEMS.TASKS.TEXT',
                subItems: [
                    {
                        id: 64,
                        label: 'MENUITEMS.TASKS.LIST.TASKLIST',
                        link: '/tasks/list',
                        parentId: 63
                    },
                    {
                        id: 65,
                        label: 'MENUITEMS.TASKS.LIST.KANBAN',
                        link: '/tasks/kanban',
                        parentId: 63
                    },
                    {
                        id: 66,
                        label: 'MENUITEMS.TASKS.LIST.CREATETASK',
                        link: '/tasks/create',
                        parentId: 63
                    }
                ]
            },
            {
                id: 67,
                label: 'MENUITEMS.CONTACTS.TEXT',
                icon: 'bxs-user-detail',
                subItems: [
                    {
                        id: 68,
                        label: 'MENUITEMS.CONTACTS.LIST.USERGRID',
                        link: '/contacts/grid',
                        parentId: 67
                    },
                    {
                        id: 69,
                        label: 'MENUITEMS.CONTACTS.LIST.USERLIST',
                        link: '/contacts/list',
                        parentId: 67
                    },
                    {
                        id: 70,
                        label: 'MENUITEMS.CONTACTS.LIST.PROFILE',
                        link: '/contacts/profile',
                        parentId: 67
                    }
                ]
            },
            {
                id: 71,
                label: 'MENUITEMS.BLOG.TEXT',
                subItems: [
                    {
                        id: 72,
                        label: 'MENUITEMS.BLOG.LIST.BLOGLIST',
                        link: '/blog/list',
                        parentId: 71
                    },
                    {
                        id: 73,
                        label: 'MENUITEMS.BLOG.LIST.BLOGGRID',
                        link: '/blog/grid',
                        parentId: 71
                    },
                    {
                        id: 74,
                        label: 'MENUITEMS.BLOG.LIST.DETAIL',
                        link: '/blog/detail',
                        parentId: 71
                    },
                ]
            },
            {
                id: 75,
                label: 'MENUITEMS.JOBS.TEXT',
                icon: 'bx-briefcase-alt',
                badge: {
                    variant: 'success',
                    text: 'MENUITEMS.JOBS.BADGE',
                },
                subItems: [
                    {
                        id: 76,
                        label: 'MENUITEMS.JOBS.LIST.JOBLIST',
                        link: '/jobs/list',
                        parentId: 75
                    },
                    {
                        id: 77,
                        label: 'MENUITEMS.JOBS.LIST.JOBGRID',
                        link: '/jobs/grid',
                        parentId: 75
                    },
                    {
                        id: 78,
                        label: 'MENUITEMS.JOBS.LIST.APPLYJOB',
                        link: '/jobs/apply',
                        parentId: 75
                    },
                    {
                        id: 79,
                        label: 'MENUITEMS.JOBS.LIST.JOBDETAILS',
                        link: '/jobs/details',
                        parentId: 75
                    },
                    {
                        id: 80,
                        label: 'MENUITEMS.JOBS.LIST.JOBCATEGORIES',
                        link: '/jobs/categories',
                        parentId: 75
                    },
                    {
                        id: 81,
                        label: 'MENUITEMS.JOBS.LIST.CANDIDATE.TEXT',
                        parentId: 75,
                        subItems: [
                            {
                                id:82,
                                label: 'MENUITEMS.JOBS.LIST.CANDIDATE.LIST.LIST',
                                link: '/jobs/candidate-list',
                                parentId:81
                            },
                            {
                                id:83,
                                label: 'MENUITEMS.JOBS.LIST.CANDIDATE.LIST.OVERVIEW',
                                link: '/jobs/candidate-overview',
                                parentId:81
                            }
                        ]
                    }
                ]
            },
        ]
    },
    {
        id: 84,
        icon: 'bx-collection',
        label: 'MENUITEMS.COMPONENTS.TEXT',
        subItems: [
            {
                id: 85,
                label: 'MENUITEMS.FORMS.TEXT',
                subItems: [
                    {
                        id: 86,
                        label: 'MENUITEMS.FORMS.LIST.ELEMENTS',
                        link: '/form/elements',
                        parentId: 85
                    },
                    {
                        id: 87,
                        label: 'MENUITEMS.FORMS.LIST.LAYOUTS',
                        link: '/form/layouts',
                        parentId: 85
                    },
                    {
                        id: 88,
                        label: 'MENUITEMS.FORMS.LIST.VALIDATION',
                        link: '/form/validation',
                        parentId: 85
                    },
                    {
                        id: 89,
                        label: 'MENUITEMS.FORMS.LIST.ADVANCED',
                        link: '/form/advanced',
                        parentId: 85
                    },
                    {
                        id: 90,
                        label: 'MENUITEMS.FORMS.LIST.EDITOR',
                        link: '/form/editor',
                        parentId: 85
                    },
                    {
                        id: 91,
                        label: 'MENUITEMS.FORMS.LIST.FILEUPLOAD',
                        link: '/form/uploads',
                        parentId: 85
                    },
                    {
                        id: 92,
                        label: 'MENUITEMS.FORMS.LIST.REPEATER',
                        link: '/form/repeater',
                        parentId: 85
                    },
                    {
                        id: 93,
                        label: 'MENUITEMS.FORMS.LIST.WIZARD',
                        link: '/form/wizard',
                        parentId: 85
                    },
                    {
                        id: 94,
                        label: 'MENUITEMS.FORMS.LIST.MASK',
                        link: '/form/mask',
                        parentId: 85
                    }
                ]
            },
            {
                id: 95,
                label: 'MENUITEMS.TABLES.TEXT',
                subItems: [
                    {
                        id: 96,
                        label: 'MENUITEMS.TABLES.LIST.BASIC',
                        link: '/tables/basic',
                        parentId: 95
                    },
                    {
                        id: 97,
                        label: 'MENUITEMS.TABLES.LIST.DataTables',
                        link: '/tables/advanced',
                        parentId: 95
                    },
                    {
                        id: 98,
                        label: 'MENUITEMS.TABLES.LIST.EditTableTables',
                        link: '/tables/editable',
                        parentId: 95
                    }
                ]
            },
            {
                id: 99,
                label: 'MENUITEMS.CHARTS.TEXT',
                subItems: [
                    {
                        id: 100,
                        label: 'MENUITEMS.CHARTS.LIST.APEX',
                        link: '/charts/apex',
                        parentId: 99
                    },
                    {
                        id: 101,
                        label: 'MENUITEMS.CHARTS.LIST.CHARTJS',
                        link: '/charts/chartjs',
                        parentId: 99
                    },
                    {
                        id: 102,
                        label: 'MENUITEMS.CHARTS.LIST.CHARTIST',
                        link: '/charts/chartist',
                        parentId: 99
                    },
                    {
                        id: 103,
                        label: 'MENUITEMS.CHARTS.LIST.ECHART',
                        link: '/charts/echart',
                        parentId: 99
                    }
                ]
            },
            {
                id: 104,
                label: 'MENUITEMS.ICONS.TEXT',
                subItems: [
                    {
                        id: 105,
                        label: 'MENUITEMS.ICONS.LIST.BOXICONS',
                        link: '/icons/boxicons',
                        parentId: 104
                    },
                    {
                        id: 106,
                        label: 'MENUITEMS.ICONS.LIST.MATERIALDESIGN',
                        link: '/icons/materialdesign',
                        parentId: 104
                    },
                    {
                        id: 107,
                        label: 'MENUITEMS.ICONS.LIST.DRIPICONS',
                        link: '/icons/dripicons',
                        parentId: 104
                    },
                    {
                        id: 108,
                        label: 'MENUITEMS.ICONS.LIST.FONTAWESOME',
                        link: '/icons/fontawesome',
                        parentId: 104
                    },
                ]
            },
            {
                id: 109,
                label: 'MENUITEMS.MAPS.TEXT',
                subItems: [
                    // {
                    //     id: 110,
                    //     label: 'MENUITEMS.MAPS.LIST.GOOGLEMAP',
                    //     link: '/maps/google',
                    //     parentId: 109
                    // },
                    {
                        id: 111,
                        label: 'MENUITEMS.MAPS.LIST.LEAFLETMAP',
                        link: '/maps/leaflet',
                        parentId: 109
                    }
                ]
            }
        ]
    },
    {
        id: 112,
        label: 'HEADER.EXTRA_PAGES.TITLE',
        icon: 'bx-file',
        subItems: [
            {
                id: 113,
                label: 'MENUITEMS.INVOICES.TEXT',
                subItems: [
                    {
                        id: 114,
                        label: 'MENUITEMS.INVOICES.LIST.INVOICELIST',
                        link: '/invoices/list',
                        parentId: 113
                    },
                    {
                        id: 115,
                        label: 'MENUITEMS.INVOICES.LIST.INVOICEDETAIL',
                        link: '/invoices/detail',
                        parentId: 113
                    },
                ]
            },
            {
                id: 116,
                label: 'MENUITEMS.AUTHENTICATION.TEXT',
                subItems: [
                    {
                        id: 117,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.LOGIN',
                        link: '/account/login',
                        parentId: 116
                    },
                    {
                        id: 119,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER',
                        link: '/account/signup',
                        parentId: 116
                    },
                    {
                        id: 120,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER2',
                        link: '/account/signup-2',
                        parentId: 116
                    },
                    {
                        id: 121,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD',
                        link: '/account/reset-password',
                        parentId: 116
                    },
                    {
                        id: 122,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD2',
                        link: '/account/recoverpwd-2',
                        parentId: 116
                    },
                    {
                        id: 123,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN',
                        link: '/pages/lock-screen-1',
                        parentId: 116
                    },
                    {
                        id: 124,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN2',
                        link: '/pages/lock-screen-2',
                        parentId: 116
                    },
                    {
                        id: 125,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL',
                        link: '/pages/confirm-mail',
                        parentId: 116
                    },
                    {
                        id: 126,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL2',
                        link: '/pages/confirm-mail-2',
                        parentId: 116
                    },
                    {
                        id: 127,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION',
                        link: '/pages/email-verification',
                        parentId: 116
                    },
                    {
                        id: 128,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION2',
                        link: '/pages/email-verification-2',
                        parentId: 116
                    },
                    {
                        id: 129,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION',
                        link: '/pages/two-step-verification',
                        parentId: 116
                    },
                    {
                        id: 130,
                        label: 'MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION2',
                        link: '/pages/two-step-verification-2',
                        parentId: 116
                    }
                ]
            },
            {
                id: 131,
                label: 'MENUITEMS.UTILITY.TEXT',
                icon: 'bx-file',
                subItems: [
                    {
                        id: 132,
                        label: 'MENUITEMS.UTILITY.LIST.STARTER',
                        link: '/pages/starter',
                        parentId: 131
                    },
                    {
                        id: 133,
                        label: 'MENUITEMS.UTILITY.LIST.MAINTENANCE',
                        link: '/pages/maintenance',
                        parentId: 131
                    },
                    {
                        id: 134,
                        label: 'Coming Soon',
                        link: '/pages/coming-soon',
                        parentId: 131
                    },
                    {
                        id: 135,
                        label: 'MENUITEMS.UTILITY.LIST.TIMELINE',
                        link: '/pages/timeline',
                        parentId: 131
                    },
                    {
                        id: 136,
                        label: 'MENUITEMS.UTILITY.LIST.FAQS',
                        link: '/pages/faqs',
                        parentId: 131
                    },
                    {
                        id: 137,
                        label: 'MENUITEMS.UTILITY.LIST.PRICING',
                        link: '/pages/pricing',
                        parentId: 131
                    },
                    {
                        id: 138,
                        label: 'MENUITEMS.UTILITY.LIST.ERROR404',
                        link: '/pages/404',
                        parentId: 131
                    },
                    {
                        id: 139,
                        label: 'MENUITEMS.UTILITY.LIST.ERROR500',
                        link: '/pages/500',
                        parentId: 131
                    },
                ]
            }
        ]
    }
];

