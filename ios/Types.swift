import Foundation
import ExpoModulesCore
import PassKit
import MoyasarSdk

struct CustomError: Error, LocalizedError {
    var errorDescription: String?
    
    init(_ description: String) {
        self.errorDescription = description
    }
}

public struct ApiApplePaySourceLocal: Codable {
    var type: String = "applepay"
    var token: String?
    var company: String?
    var name: String?
    var number: String?
    var message: String?
    var manual: String?
}

enum ApplePayModalStatus: String {
    case open
    case close
}

enum ApplePayPaymentStatusSource: String {
    case moyasar
    case local
}

struct ApplePayPaymentStatus {
    var paymentStatus: String
    var amount: Int
    var source: ApplePayPaymentStatusSource
    var moyasar_payment_id: String = ""
    var errorDescription: String = ""
    
    init(paymentStatus: String, amount: Int, source: ApplePayPaymentStatusSource, moyasar_payment_id: String? = nil, errorDescription: String? = nil) {
        self.paymentStatus = paymentStatus
        self.amount = amount
        self.source = source
        self.moyasar_payment_id = moyasar_payment_id ?? ""
        self.errorDescription = errorDescription ?? ""
    }
    
    func toParsable() -> [String: Any] {
        return [
            "status": paymentStatus,
            "moyasarPaymentID": moyasar_payment_id,
            "amount": amount,
            "source": source.rawValue,
            "errorDescription": errorDescription
        ]
    }
}

struct Summary: Record {
    @Field
    var itemTitle: String
    
    @Field
    var itemAmount: Int
}

struct MoyasarMetaData: Record {
    @Field
    var key: String
    
    @Field
    var value: String
}

struct ApplePayOptions: Record {
    @Field
    var moyasarPublicKey: String

    @Field
    var amount: Int
    
    @Field
    var companyName: String
    
    @Field
    var description: String = ""
    
    @Field
    var currency: String = "SAR"
    
    @Field
    var merchantIdentifier: String
    
    @Field
    var isMadaSupported: Bool = true
    
    @Field
    var isVisaSupported: Bool = true
    
    @Field
    var isMasterCardSupported: Bool = true
    
    @Field
    var isAmexSupported: Bool = true
    
    @Field
    var countryCode: String = "SA"
    
    @Field
    var isMerchant3DSEnabled: Bool = true
    
    @Field
    var summaryItems: [Summary] = []
    
    @Field
    var metaData: [MoyasarMetaData] = []
}

