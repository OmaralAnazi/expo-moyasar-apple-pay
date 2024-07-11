# expo-moyasar-apple-pay

A React Native Expo library designed for integrating Moyasar Apple Pay with Expo applications.

## Installation & Configuration & Usage

1. Install the library.

```sh
npm install expo-moyasar-apple-pay
```

2. Create a new file for the plugin (e.g., apple-pay-config-plugin.js) and add the following code to it. You can store it wherever you want, but it makes the most sense to place it inside a plugins folder at the root level


```js
const {withDangerousMod} = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');
const {
    mergeContents,
} = require('@expo/config-plugins/build/utils/generateCode');

const withIOS = config => {
    return withDangerousMod(config, [
        'ios',
        async config => {
            const filePath = path.join(
                config.modRequest.platformProjectRoot,
                'Podfile',
            );
            const contents = fs.readFileSync(filePath, 'utf-8');

            const moyasarPodfileDep = mergeContents({
                tag: 'add Moyasar SDK to Podfile',
                src: contents,
                newSrc: [
                    `pod 'MoyasarSdk', git: 'https://github.com/moyasar/moyasar-ios-pod.git'`,
                ].join('\n'),
                anchor: 'config = use_native_modules!',
                offset: 0,
                comment: '#',
            });

            fs.writeFileSync(filePath, moyasarPodfileDep.contents);

            return config;
        },
    ]);
};

module.exports = withIOS;
```

3. Integrate the plugin into your `app.config.js` (or `app.json`)

```js
module.exports = {
    expo: {
        ...
        plugins: [
             ... your plugins if exists ...
            "./plugins/apple-pay-config-plugin.js",
        ],
        ...
    }
}
```

4. Include these keys (Merchant and AppBundleID) in your `app.config.js` (or `app.json`)

```js
module.exports = {
    expo: {
        ...
        ios: {
            ...
            bundleIdentifier: "YOUR AppBundleID KEY GOES HERE",
            entitlements: {
              "com.apple.developer.in-app-payments": ["YOUR Merchant KEY GOES HERE"]
            }
            ...
        },
        ...
    }
}
```

5. Add this reusable component (e.g., in the components folder). Ideally, this component should be provided directly from the library. However, due to some issues with integrating React Native code with native code, I recommend copying it into your components folder for now. This will be fixed in the future, but for now, please follow the use of this component as described.

```jsx
import * as MoyasarApplePay from "expo-moyasar-apple-pay";
import React, { useEffect, useState, ReactNode } from "react";
import {
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
  StyleSheet,
} from "react-native";

interface ApplePayBtnProps extends MoyasarApplePay.ApplePayOptions {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  onClose?: () => void;
  onOpen?: () => void;
  onSuccessfulPayment?: (
    payload: MoyasarApplePay.OnApplePayCompletedPayload
  ) => void;
  onFailedPayment?: (
    payload: MoyasarApplePay.OnApplePayCompletedPayload
  ) => void;
}

const ApplePayBtn: React.FC<ApplePayBtnProps> = (props) => {
  const {
    amount,
    moyasarPublicKey,
    merchantIdentifier,
    countryCode,
    currency,
    isMadaSupported,
    isAmexSupported,
    isMasterCardSupported,
    isVisaSupported,
    isMerchant3DSEnabled,
    description,
    metaData,
    summaryItems,
    style,
    children,
    onClose,
    onOpen,
    onSuccessfulPayment,
    onFailedPayment,
  } = props;

  const [canMakePayments, setCanMakePayments] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkCanMakePayments() {
      try {
        const result = await MoyasarApplePay.canMakePayments();
        setCanMakePayments(result);
      } catch (error) {
        console.error("Error checking payment capability", error);
        setCanMakePayments(false);
      }
    }

    checkCanMakePayments();
  }, []);

  useEffect(() => {
    if (canMakePayments === false) return;

    const closedListener = MoyasarApplePay.onApplePayModalStatusChanged(
      (payload) => {
        if (payload.value === "open") {
          onOpen?.();
        } else {
          onClose?.();
        }
      }
    );

    const completedListener = MoyasarApplePay.onApplePayCompleted((payload) => {
      if (payload.status === "paid") {
        onSuccessfulPayment?.(payload);
      } else {
        onFailedPayment?.(payload);
      }
    });

    return () => {
      closedListener.remove();
      completedListener.remove();
    };
  }, [canMakePayments, onClose, onOpen, onSuccessfulPayment, onFailedPayment]);

  if (canMakePayments === null || canMakePayments === false) {
    return null;
  }

  return (
    <Pressable
      onPress={() => {
        MoyasarApplePay.initiateApplePayPayment({
          amount,
          moyasarPublicKey,
          merchantIdentifier,
          countryCode,
          currency,
          isMadaSupported,
          isAmexSupported,
          isMasterCardSupported,
          isVisaSupported,
          isMerchant3DSEnabled,
          description,
          metaData,
          summaryItems,
        }).catch((err: any) => {
          console.error("Payment initiation error", err);
        });
      }}
      style={[styles.defaultButton, style]}
    >
      {children ? (
        children
      ) : (
        <Text style={styles.defaultText}>Pay With Apple Pay</Text> // you can customize this and add Apple Pay Icon
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  defaultButton: {
    backgroundColor: "black",
    padding: 12,
    width: "100%",
    alignItems: "center",
  },
  defaultText: {
    color: "white",
    fontSize: 20,
  },
});

export default ApplePayBtn;
```

6. Example Usage

```jsx
import ApplePayBtn from "./ApplePayBtn";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Merchant, MoyasarKeys } from "./configs.dev";

export default function App() {
  const [amount, setAmount] = useState(100); 

  return (
    <View style={styles.container}>
      <TextInput
        style={{
          backgroundColor: "#C4D5D4",
          width: "60%",
          borderRadius: 20,
          padding: 10,
          fontSize: 20,
        }}
        returnKeyType="done"
        keyboardType="number-pad"
        value={`${amount}`}
        onChangeText={(text) => {
          if (text === "") {
            setAmount(0);
            return;
          }
          setAmount(Number(text));
        }}
      />

      <ApplePayBtn
        onFailedPayment={(payload) => console.log(payload.errorDescription)}
        onSuccessfulPayment={(payload) => console.log(payload.moyasarPaymentID)} // you can pass any logic to hanlde successful payment here
        onClose={() => console.log("Apple Pay Modal is Closed")}
        onOpen={() => console.log("Apple Pay Modal is Opened")}
        amount={amount * 100} // In cents, so you have to multiple with 100
        moyasarPublicKey={MoyasarKeys.TEST}
        merchantIdentifier={Merchant}
        countryCode="SA"
        currency="SAR"
        isMadaSupported={true}
        isAmexSupported={false}
        isMasterCardSupported={true}
        isVisaSupported={true}
        isMerchant3DSEnabled={true}
        description="Expo Apple Pay Library"
        metaData={[
          {
            key: "payment_id",
            value: "test-payment-id-native-button",
          },
          {
            key: "sequence_id",
            value: "test-sequence_id-id-native-button",
          },
        ]}
        summaryItems={[ 
          {
            itemAmount: amount * 100, // convert to cents
            itemTitle: "Investment Fund 1",
          },
          {
            itemAmount: amount * 100, // convert to cents
            itemTitle: "Investment Fund 2",
          },
          {
            itemAmount: amount * 100, // convert to cents
            itemTitle: "Investment Fund 3",
          },
        ]}
        style={{
          marginVertical: 16,
          width: "90%",
        }}
      >
        <Text style={{ color: "white", fontSize: 20 }}>
          Custom Apple Pay Text
        </Text>
      </ApplePayBtn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
```

7. Run the code on a real device, as Apple Pay doesn't work on simulators.

```sh
npx expo run:ios --device
```

8. If it didn't work, ensure that your Moyasar and Apple Developer accounts are properly set up. For more information, click [here](https://docs.moyasar.com/apple-pay-using-developer-account).

## Credits

This library was inspired by and adapted from another React Native Apple Pay integration library. Special thanks to the contributors of that project. You can find more details [here](https://github.com/Malaa-tech/react-native-moyasar-apple-pay).
