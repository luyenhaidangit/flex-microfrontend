export const environment = {
  production: true,
  defaultauth: 'fackbackend',
  apiBaseUrl: '',
  agentApiBaseUrl: '',
  agentRealtimeHubPath: '/hubs/application',
  exchangeApiBaseUrl: '',
  marketBoardPollingIntervalMs: 2000,
  demoBrokers: [
    { id: 'DEMO-BUYER', name: 'Demo Buyer' },
    { id: 'DEMO-SELLER', name: 'Demo Seller' }
  ],
  externalService: {
    translateServiceUrl: '/assets/i18n/',
    configServiceUrl: '/assets/dashboard.json'
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};
