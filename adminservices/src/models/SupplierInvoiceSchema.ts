import mongoose from 'mongoose';

const supplierInvoiceSchema = new mongoose.Schema({

    InvoiceAmount: {
        type: Number
    },
    NameOfVendor: {
        type: String
    },

    InvoiceNumber: {
        type: Number
    },
    flag: {
        type: String
    },
    HRejectedDate: {
        type: Date
    },
    venderDocURL: {
        type: String
    },
    InvoiceDate: {
        type: Date,
        default: Date.now
    },
    Status: {
        type: String
    },
    HospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    VendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    LenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    /////////////////////////////////////////////////////////////////Date////////////////////////////////////////////////////////////////////////////////////////////////////////////
    HResponseDate: {
        type: Date
    },
    ///not in project
    HRepaidDate: {
        type: Date
    },
    LResponseDate: {
        type: Date
    },
    LRejectDate: {
        type: Date
    },
    hDueDate: {
        type: Date
    },
    RepaymentDueDate: {
        type: String
    },
    OverdueNoOfDays: {
        type: Number
    },
    TotalDeduction: {
        type: Number
    },
    OverdueCharges: {
        type: Number
    },
    BalanceAmount: {
        type: Number
    },
    AmtToTransfer: {
        type: Number
    },
    PastRecoveryAmount: {
        type: Number
    },
    ///overpaid full paid
    SettleStatus: {
        type: String
    },
    HospitalComment: {
        type: String
    },
    LenderComment: {
        type: String
    },
    ROI: {
        type: Number
    },
    Tenure: {
        type: String
    },
    LTV: {
        type: Number
    },
    RateOfDeduction: {
        type: Number
    },
    NoOfDaysCreditPeriod: {
        type: Number
    },
    amountToBeDisbursed: {
        type: Number
    },
    LTVAmount: {
        type: Number
    },
    Description: {
        type: String
    },
    ApprovedAmount: {
        type: Number
    },
    AmountPaid: {
        type: Number
    },
    upfrontInterest: {
        type: Number
    },
    NEFT_RTG: {
        type: String
    },
    PaymentDate: {
        type: Date
    },
    AmountReceived: {
        type: Number
    },
    ReceivedNEFT_RTG: {
        type: String
    },
    PaymentReceivedDate: {
        type: Date
    },
    AdditionalInterest: {
        type: Number
    },
    GRNDate: {
        type: Date
    },
    GRNNo: {
        type: Number
    },
    GRNValue: {
        type: Number
    },
    GRNNotes: {
        type: String
    },
    GRNDocuments: {
        type: String
    },
    LateRecoveryAmount: {
        type: Number
    },
    RecoveryInvoiceNumber: {
        type: Number
    },
    DescriptionArr: [{
        type: Array
    }],
    PastRecoveryDetails: {
        type: String
    },
},
    { timestamps: true },
);

export default mongoose.model<mongoose.Document>('supplier_Invoices', supplierInvoiceSchema);
