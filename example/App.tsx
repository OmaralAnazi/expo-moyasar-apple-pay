import ApplePayBtn from "./ApplePayBtn";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Merchant, MoyasarKeys } from "./configs.dev";

export default function App() {
  const [amount, setAmount] = useState(1); 

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
        onFailedPayment={(payload) => console.log(payload)}
        onSuccessfulPayment={(payload) => console.log(payload.moyasarPaymentID)}
        onClose={() => console.log("Apple Pay Modal is Closed")}
        onOpen={() => console.log("Apple Pay Modal is Opened")}
        amount={amount*100}
        moyasarPublicKey={MoyasarKeys.TEST}
        merchantIdentifier={Merchant}
        countryCode="SA"
        currency="SAR"
        isMadaSupported={true}
        isAmexSupported={false}
        isMasterCardSupported={false}
        isVisaSupported={false}
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
            itemAmount: amount*100,
            itemTitle: "Investment Fund 1",
          },
          // {
          //   itemAmount: amount*100,
          //   itemTitle: "Investment Fund 2",
          // },
          // {
          //   itemAmount: amount*100,
          //   itemTitle: "Investment Fund 3",
          // },
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
