import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.copiadeseguranca.app",
  appName: "CopiaDeSeguranca",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
