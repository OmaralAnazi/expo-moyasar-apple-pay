
// this is the key that you get from moyasar dashboard
const MoyasarKeys = {
  TEST: "pk_test",
  WRONG: "pk_wrong", // testing wrong scenarios
  PROD: "pk_live",
};

// this is setup from apple developer account
// you hav eto set it in order to enable apple pay
const Merchant = "merchant.your.domain";

// this is the bundle id of your app, this should match the 
// app id that has the merchant id above
const AppBundleID = "your.domain";

module.exports = {
  MoyasarKeys,
  Merchant,
  AppBundleID,
};
