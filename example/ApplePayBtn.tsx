import * as MoyasarApplePay from "moyasar-apple-pay";
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
