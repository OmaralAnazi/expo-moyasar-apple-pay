import ExpoModulesCore
import PassKit
import MoyasarSdk

public class MoyasarApplePayModule: Module {
    var paymentRequest: PKPaymentRequest!
    var paymentAuthorizationControllerDelegate: PaymentAuthorizationControllerDelegate!
    var applePayOptions: ApplePayOptions!
    
    public required init(appContext: AppContext) {
        super.init(appContext: appContext)
        paymentAuthorizationControllerDelegate = PaymentAuthorizationControllerDelegate()
        paymentAuthorizationControllerDelegate.moyasarApplePayModule = self
    }
    
    public func definition() -> ModuleDefinition {
        Name("MoyasarApplePay")
        Events("onApplePayModalStatusChanged", "onApplePayCompleted")
        
        AsyncFunction("initiateApplePayPayment") { (applePayOptions: ApplePayOptions) -> Void in
            do {
                try initiatePayment(applePayOptions: applePayOptions)
            } catch {
                throw error
            }
        }
        
        AsyncFunction("canMakePayments") {
            return PKPaymentAuthorizationController.canMakePayments()
        }

    }
    
    func onApplePayModalStatusChanged(applePayModalStatus: ApplePayModalStatus) {
        self.sendEvent("onApplePayModalStatusChanged", [
            "value": applePayModalStatus.rawValue
        ])
    }
    
    func onApplePayCompleted(applePayPaymentStatus: ApplePayPaymentStatus) {
        self.sendEvent("onApplePayCompleted", applePayPaymentStatus.toParsable())
    }
    
    func initiatePayment(applePayOptions: ApplePayOptions) throws {
        self.applePayOptions = applePayOptions
       
        do {
            try initiateApplePayPayment()
        } catch {
            throw error
        }
    }
    
    private func initiateApplePayPayment() throws {
        let paymentRequest = createPaymentRequest()
        
        if let applePayVC = PKPaymentAuthorizationViewController(paymentRequest: paymentRequest) {
            applePayVC.delegate = paymentAuthorizationControllerDelegate!
            
            DispatchQueue.main.async {
                self.onApplePayModalStatusChanged(applePayModalStatus: .open)
                self.appContext?.utilities?.currentViewController()?.present(applePayVC, animated: true)
            }
        } else {
            throw CustomError("Unable to initialize PKPaymentAuthorizationViewController, check paymentOptions are correct, (Check Native Logs)")
        }
    }
    
    private func createPaymentRequest() -> PKPaymentRequest {
        paymentRequest = PKPaymentRequest()
        paymentRequest.merchantIdentifier = applePayOptions.merchantIdentifier
        paymentRequest.supportedNetworks = []
        
        paymentRequest.supportedNetworks = [
            applePayOptions.isAmexSupported ? .amex : nil,
            applePayOptions.isMadaSupported ? .mada : nil,
            applePayOptions.isVisaSupported ? .visa : nil,
            applePayOptions.isMasterCardSupported ? .masterCard : nil
        ].compactMap { $0 }
        
        if (applePayOptions.isMerchant3DSEnabled) {
            paymentRequest.merchantCapabilities = .capability3DS
        }
        paymentRequest.countryCode = applePayOptions.countryCode
        paymentRequest.currencyCode = applePayOptions.currency
        
        paymentRequest.paymentSummaryItems = createPaymentSummaryItems()
      
        return paymentRequest
    }

    private func createPaymentSummaryItems() -> [PKPaymentSummaryItem] {
        var summaryItems: [PKPaymentSummaryItem] = []
        var totalAmount: Float = 0.0
        
        for summaryItem in applePayOptions.summaryItems {
            let itemAmount = Float(summaryItem.itemAmount) / 100
            let item = PKPaymentSummaryItem(label: summaryItem.itemTitle, amount: NSDecimalNumber(value: itemAmount))
            summaryItems.append(item)
            totalAmount += itemAmount
        }
        
        let totalItem = PKPaymentSummaryItem(label: "Total", amount: NSDecimalNumber(value: totalAmount))
        summaryItems.append(totalItem)
        
        return summaryItems
    }

}
