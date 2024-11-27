//utils/wakeLockManager.ts
export class WakeLockManager {
    private wakeLock: WakeLockSentinel | null = null;
  
    constructor() {
      // Reacquire Wake Lock if the tab becomes visible
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  
    // Request Wake Lock
    async requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          this.wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activated.');
  
          // Reacquire Wake Lock on release
          this.wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released. Reacquiring...');
            this.requestWakeLock();
          });
        } else {
          console.warn('Wake Lock API is not supported in this browser.');
        }
      } catch (error) {
        console.error('Failed to acquire Wake Lock as screen migh be inactive:', error);
      }
    }
  
    // Reacquire Wake Lock when the page becomes visible again
    private handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        this.requestWakeLock();
      }
    };
  
    // Cleanup resources
    cleanup() {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      this.releaseWakeLock();
    }
  
    // Release Wake Lock
    releaseWakeLock() {
      if (this.wakeLock) {
        this.wakeLock.release();
        this.wakeLock = null;
        console.log('Wake Lock manually released.');
      }
    }
  }
  