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
    JHeader: JHeader;
    JMetaData: JMetaData;
    JData: JData[][];
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    jobData: JobApiResponse | null;
  }
  
  export interface CurrentViewState {
    currentRoute: string;
  }

  export interface PAuthToken{
    token: string
  }
  