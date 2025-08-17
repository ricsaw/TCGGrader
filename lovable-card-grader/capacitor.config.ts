<<<<<<< HEAD
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.richardsawh.pokeprices',
  appName: 'TCGAppraisal',
  webDir: 'dist'
};

export default config;
=======
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.03b7adc6930342988669b349096065da',
  appName: 'lovable-card-grader',
  webDir: 'dist',
  server: {
    url: 'https://03b7adc6-9303-4298-8669-b349096065da.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    }
  }
};

export default config;
>>>>>>> 1dd73cea7c007f4974620682aae28f39c681fb17
