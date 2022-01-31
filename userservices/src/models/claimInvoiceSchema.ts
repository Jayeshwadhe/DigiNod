import mongoose from 'mongoose';

const AutoIncrement = require('mongoose-sequence')(mongoose);

const InvoiceSchema = new mongoose.Schema({

    nameOfHospital: {
        type: String
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    validatorName: {
        type: String
    },
    validatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    aggregatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    LenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    claimId: {
        type: String
    },
    isSplit: {
        type: Boolean,
        default: false,
        required: false,
    },
    agriDisbursmentAmt: {
        type: Number,
        required: false,
    },
    hospitalDisbursmentAmt: {
        type: Number,
        required: false,
    },
    aggriInterest: {
        type: Number,
        required: false,
    },
    hospitalInterest: {
        type: Number,
        required: false,
    },
    totalIntrest : {
        type: Number,
        required: false
      },
    hospitalSplitAmount: {
        type: Number,
        required: false,
    },
    hospitalROI: {
        type: Number,
        required: false,
    },
    aggriROI: {
        type: Number,
        required: false,
    },
    aggriSplitAmount: {
        type: Number,
        required: false,
    },
    finalBillDate: {
        type: Date
    },
    nameOfInsurer: {
        type: String
    },
    finalBillNumber: {
        type: String
    },
    final_bill_amount: {
        type: Number
    },
    nameOfTPA: {
        type: String
    },
    dateOfAdmission: {
        type: Date
    },
    claimSubmissionDate: {
        type: Date
    },
    claimAmount: {
        type: Number
    },
    ApporvedAmount: {
        type: Number
    },
    AmountDisbursed: {
        type: Number
    },
    Fundedloanid: {
        type: Number
    },
    BeforeCreditLimit: {
        type: Number
    },
    AfterCreditLimit: {
        type: Number
    },
    dateOfDischarge: {
        type: Date
    },
    Status: {
        type: String
    },
    invoiceDocumentUrl: {
        type: String
    },
    insuranceApprovalLetter: {
        type: String
    },
    invoiceId: {
        type: String
    },
    Date: {
        type: Date
    },
    approvalNumber: {
        type: Number
    },
    policyNumber: {
        type: String
    },
    LenderComment: {
        type: String
    },
    DigiSparshComment: {
        type: String
    },
    comments: {
        type: String
    },
    PaymentDate: {
        type: Date
    },
    LTV: {
        type: Number
    },
    LTVAmount: {
        type: Number
    },
    LenderLTV: {
        type: Number
    },
    LenderTenure: {
        type: Number
    },
    LenderROI: {
        type: Number
    },
    LenderApprovalAmount: {
        type: Number
    },
    Description: {
        type: String
    },
    Amount: {
        type: Number
    },
    lineTotal: {
        type: String
    },
    Total: {
        type: String
    },
    validationDate: {
        type: Date
    },
    FundedDate: {
        type: Date
    },
    insurerAprovedAmount: {
        type: Number
    },
    LresponseDate: {
        type: Date
    },
    DresponseDate: {
        type: Date
    },
    ///////////////////////////////////////////////////////////Additional Field from Sheet ////////////////////////
    AmountReceived: {
        type: Number
    },
    ReceivedNEFT_RTG: {
        type: String
    },
    PaymentReceivedDate: {
        type: Date
    },
    ReceivedDate: {
        type: Date
    },
    tds_amount: {
        type: Number
    },
    preAuthSubmittedDate: {
        type: Date
    },

    TATofDischargeClaimSubmission: {
        type: Date
    },
    NEFT_RTG: {
        type: String
    },

    claimApprovedDate: {
        type: Date
    },
    TATofSubmissionDatetoClaimApproval: {
        type: Number
    },
    claimFullyPaidDate: {
        type: Date
    },
    TATofClaimPayment: {
        type: String
    },
    reconcile_remarks: {
        type: Date
    },
    name: {
        type: String
    },
    ftc_date: {
        type: Number
    },
    Month: {
        type: String
    },
    Count: {
        type: String
    },
    PercentageofAmountApproved: {
        type: Date
    },
    RepaidStatus: {
        type: String
    },
    RepaidDate: {
        type: Date
    },
    RepaidAmount: {
        type: Number
    },
    AmountTakenbyLender: {
        type: Number
    },
    AmountTakenbyhospital: {
        type: Number
    },

    TotalDeduction: {
        type: Number
    },
    PastRecovery: {
        type: Number
    },
    BalanceAmount: {
        type: Number
    },
    PastRecoveryNumber: {
        type: String
    },

    PastRecoveryDetails: {
        type: String
    },
    LateRecovery: {
        type: Number
    },
    SettleStatus: {
        type: String
    },

    AdditionalDays: {
        type: Number
    },
    Interest: {
        type: Number
    },
    PFFees: {
        type: Number
    },
    RemainingAmount: {
        type: Number
    },
    AmountToBePaid: {
        type: Number
    },
    AdditionalInterest: {
        type: Number
    },
    DueDate: {
        type: Date
    },
    isDeleted: Boolean
}, {
    timestamps: true
});

InvoiceSchema.plugin(AutoIncrement, {
    inc_field: "LoanID",
    start_seq: 202001,
});


export default mongoose.model<ClaimInvoiceDoc>('Invoice', InvoiceSchema);

export interface ClaimInvoiceDoc extends mongoose.Document {
    nameOfHospital: string,
    hospitalId: any,
    validatorName: string,
    validatorId: mongoose.Schema.Types.ObjectId,
    // aggregatorId: mongoose.Schema.Types.ObjectId,
    isSplit: boolean,
    hospitalSplitAmount: number,
    hospitalROI: number,
    aggriSplitAmount: number,
    aggriROI: number,
    LenderId: mongoose.Schema.Types.ObjectId,
    claimId: string,
    finalBillDate: Date,
    nameOfInsurer: string,
    finalBillNumber: string,
    final_bill_amount: number,
    nameOfTPA: string,
    dateOfAdmission: Date,
    claimSubmissionDate: Date,
    claimAmount: number,
    ApporvedAmount: number,
    AmountDisbursed: number,
    Fundedloanid: number,
    BeforeCreditLimit: number,
    AfterCreditLimit: number,
    dateOfDischarge: Date,
    Status: string,
    invoiceDocumentUrl: string,
    insuranceApprovalLetter: string,
    invoiceId: string,
    Date: Date,
    approvalNumber: number,
    policyNumber: string,
    LenderComment: string,
    DigiSparshComment: string,
    comments: string,
    PaymentDate: Date,
    LTV: number,
    LTVAmount: number,
    LenderLTV: number,
    LenderTenure: number,
    LenderROI: number,
    LenderApprovalAmount: number,
    Description: string,
    Amount: number,
    lineTotal: string,
    Total: string,
    validationDate: Date,
    FundedDate: Date,
    insurerAprovedAmount: number,
    LresponseDate: Date,
    DresponseDate: Date,

    ///////////////////////////////////////////////////////////Additional Field from Sheet ////////////////////////

    AmountReceived: number,
    ReceivedNEFT_RTG: string,
    PaymentReceivedDate: Date,
    ReceivedDate: Date,
    tds_amount: Number,
    preAuthSubmittedDate: Date,

    TATofDischargeClaimSubmission: Date,
    NEFT_RTG: string,

    claimApprovedDate: Date,
    TATofSubmissionDatetoClaimApproval: number,
    claimFullyPaidDate: Date,
    TATofClaimPayment: string,
    reconcile_remarks: Date,
    name: string,
    ftc_date: number,
    Month: string,
    Count: string,
    PercentageofAmountApproved: Date,
    RepaidStatus: string,
    RepaidDate: Date,
    RepaidAmount: number,
    AmountTakenbyLender: number,
    AmountTakenbyhospital: number,
    TotalDeduction: number,
    PastRecovery: number,
    BalanceAmount: number,
    PastRecoveryNumber: string,
    PastRecoveryDetails: string,
    LateRecovery: number,
    SettleStatus: string,
    AdditionalDays: number,
    Interest: number,
    PFFees: number,
    RemainingAmount: number,
    AmountToBePaid: number,
    AdditionalInterest: number,
    DueDate: Date,


}




