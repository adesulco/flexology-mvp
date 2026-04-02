import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jemariapp.flex',
  appName: 'Flex',
  webDir: 'public', // Unused in this architecture since we rely on Server URL
  server: {
    url: 'https://flex.jemariapp.com',
    cleartext: true
  }
};

export default config;
