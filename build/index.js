import { NativeModulesProxy, EventEmitter, Platform, } from "expo-modules-core";
import MoyasarApplePayModule from "./MoyasarApplePayModule";
const emitter = new EventEmitter(MoyasarApplePayModule ?? NativeModulesProxy.MoyasarApplePay);
export function onApplePayModalStatusChanged(listener) {
    return emitter.addListener("onApplePayModalStatusChanged", listener);
}
export function onApplePayCompleted(listener) {
    return emitter.addListener("onApplePayCompleted", listener);
}
export async function initiateApplePayPayment(applePayOptions) {
    return await MoyasarApplePayModule.initiateApplePayPayment(applePayOptions);
}
export async function canMakePayments() {
    if (Platform.OS === "android") {
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    }
    return MoyasarApplePayModule.canMakePayments();
}
//# sourceMappingURL=index.js.map