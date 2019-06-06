
export interface VmcAppConfig {
  storageNamespace: string;
  vidiunServer: {
      expiry: number;
      privileges: string;
  },
  routing: {
    errorRoute: string;
    loginRoute: string;
    defaultRoute: string;
  },
  locales: {
    id: string;
    label: string;
  }[];
}


export const vmcAppConfig: VmcAppConfig = {
  'storageNamespace': 'vmc-ng',
  'vidiunServer': {
      "expiry": 86400,
      "privileges": "disableentitlement,appid:vmc"
  },
  'routing': {
    'errorRoute': '/error',
    'loginRoute': '/login',
    'defaultRoute': '/',
  },
  'locales': [
    {
      'id': 'en',
      'label': 'English'
    },
    {
      'id': 'de',
      'label': 'Deutsch'
    },
    {
      'id': 'es',
      'label': 'Español'
    },
    {
      'id': 'fr',
      'label': 'Français'
    },
    {
      'id': 'ja',
      'label': '日本語'
    }
  ]
};
