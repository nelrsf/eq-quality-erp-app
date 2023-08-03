import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoquality.app',
  appName: 'eco-quality',
  webDir: 'dist/eco-quality',
  server: {
    androidScheme: 'https'
  }
};

export default config;
