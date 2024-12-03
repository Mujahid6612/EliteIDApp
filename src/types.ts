// types.ts
export interface JHeader {
  ActionCode: number;
  Message: string;
  SysVersion: string;
}

  
  export interface JMetaData {
    Headings: [string, string][];
  }
  
  export interface JData {
    jobType: string;
    jobId: string;
    jobNumber: number;
    reservationDateTime: string;
    pickupAddress: string;
    dropoffAddress: string;
    passengerName: string;
    passengerPhone: string;
    showAcceptButton: string;
    showRejectButton: string;
    showCloseButton: string;
    showArriveButton: string;
    showStartButton: string;
    showAddStopButton: string;
    showEndButton: string;
    showSaveButton: string;
  }
  
  export interface JobApiResponse {
    JHeader?: JHeader; // Optional
    JMetaData: JMetaData;
    JData: JData[][];
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    jobData: Record<string, JobApiResponse | null>; // Maps job IDs to job data
  }
  
  export interface CurrentViewState {
    currentRoutes: Record<string, string>; // Maps job IDs to routes
  }

  export interface PAuthToken{
    tokens: Record<string, string>;
  }
  