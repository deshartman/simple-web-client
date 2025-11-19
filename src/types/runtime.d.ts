// Type declarations for Twilio Runtime global object

declare global {
  namespace Runtime {
    interface Asset {
      path: string;
      open: () => string;
    }

    interface Assets {
      [assetPath: string]: Asset;
    }

    function getAssets(): Assets;
  }
}

export {};
