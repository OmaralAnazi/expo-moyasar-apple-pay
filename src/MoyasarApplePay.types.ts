export type onApplePayModalStatusChangedPayload = {
  value: "open" | "close";
};

export type OnApplePayCompletedPayload = {
  status: "paid" | "failed" | "error";
  source: "moyasar" | "local";
  moyasarPaymentID: string;
  amount: number;
  errorDescription?: string;
};

export type SummaryItem = {
  itemTitle: string;
  itemAmount: number;
};

export type MetaDataItem = {
  key: string;
  value: string;
};

export type ApplePayOptions = {
  moyasarPublicKey: string;
  amount: number;
  companyName: string;
  description?: string;
  currency?: string;
  merchantIdentifier: string;
  isMadaSupported?: boolean;
  isVisaSupported?: boolean;
  isMasterCardSupported?: boolean;
  isAmexSupported?: boolean;
  countryCode?: string;
  isMerchant3DSEnabled?: boolean;
  summaryItems: [SummaryItem, ...SummaryItem[]]; // Enforce at least one item
  metaData?: MetaDataItem[];
};

