import mongoose from 'mongoose';

const approvedloansSchema = new mongoose.Schema(
  {
    KOCode: {
      type: String,
    },
    FullName: {
      type: String,
    },
    ApplicantsPanNo: {
      type: String,
    },
    ApplicantsAadhaarNo: {
      type: String,
    },
    DateOfBirth: {
      type: String,
    },
    BankAssociated: {
      type: String,
    },
    Occupation: {
      type: String,
    },
    CurrentAddress: {
      type: String,
    },
    State: {
      type: String,
    },
    City: {
      type: String,
    },
    Country: {
      type: String,
    },
    uploadAadharDoc: {
      type: String,
    },
    uploadPANDoc: {
      type: String,
    },
    Pincode: {
      type: String,
    },
    MobileNumber: {
      type: String,
    },
    EmailId: {
      type: String,
    },
    LoanAmount: {
      type: Number,
    },
    LLCode: {
      type: String,
    },
    EMIAmount: {
      type: Number,
    },
    Scheme: {
      type: String,
    },
    ReferenceName: {
      type: String,
    },
    ActionNeeded: {
      type: String,
    },
    AlternateContactNumber: {
      type: Number,
    },
    Status: {
      type: String,
    },
    //String
    Interest: {
      type: String,
    },
    ProcessingFees: {
      type: String,
    },
    ROI: {
      type: String,
    },
    //For Disbursment
    AccountNumber: {
      type: String,
    },
    //For Repaymnet
    AccountNumberForSBI: {
      type: String,
    },
    District: {
      type: String,
    },
    Branch: {
      type: String,
    },
    BranchCode: {
      type: String,
    },
    IFSCCode: {
      type: String,
    },
    AccountHolderName: {
      type: String,
    },
    ApproveOrReject: {
      type: String,
    },
    valueChanged: {
      type: String,
    },
    ApplicationDate: {
      type: Date,
    },
    DisbursementDate: {
      type: Date,
    },
    RepaymentDate: {
      type: Date,
    },
    RepaymentDate1st: {
      type: Date,
    },
    RepaymentDate2nd: {
      type: Date,
    },
    RepaymentDate3rd: {
      type: Date,
    },
    RepaymentDate4th: {
      type: Date,
    },
    RepaymentDate5th: {
      type: Date,
    },
    RepaymentDate6th: {
      type: Date,
    },
    NachRegistration: {
      type: String,
    },
    Aggregator: {
      type: String,
    },

    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    CreatedDate: {
      type: String,
    },
    UpdatedDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
// module.exports = mongoose.model('approvedloans', approvedloansSchema);
export default mongoose.model<mongoose.Document>('approvedloans', approvedloansSchema);

export interface approvedLoanDC extends mongoose.Document {
  Status: string;
}
