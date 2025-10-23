import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dawarpower.app',
  appName: 'Dawar Power',
  webDir: 'dist/fitness-app',
  server: {
    url: process.env.CAP_SERVER_URL ?? undefined,
    cleartext: true,
  },
};

export default config;
