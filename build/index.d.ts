import { Subscription } from "expo-modules-core";
import { ApplePayOptions, onApplePayModalStatusChangedPayload, OnApplePayCompletedPayload } from "./MoyasarApplePay.types";
export declare function onApplePayModalStatusChanged(listener: (event: onApplePayModalStatusChangedPayload) => void): Subscription;
export declare function onApplePayCompleted(listener: (event: OnApplePayCompletedPayload) => void): Subscription;
export declare function initiateApplePayPayment(applePayOptions: ApplePayOptions): Promise<any>;
export declare function canMakePayments(): Promise<boolean>;
export type { onApplePayModalStatusChangedPayload, OnApplePayCompletedPayload, ApplePayOptions, };
//# sourceMappingURL=index.d.ts.map