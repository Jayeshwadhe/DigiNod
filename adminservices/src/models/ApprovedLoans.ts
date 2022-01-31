import { isDate } from 'lodash';
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
      type: String,
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
    // EMIAmount: {
    //     type: Number
    // },
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
    RepaymentDate7th: {
      type: Date,
    },
    RepaymentDate8th: {
      type: Date,
    },
    RepaymentDate9th: {
      type: Date,
    },
    RepaymentDate10th: {
      type: Date,
    },
    RepaymentDate11th: {
      type: Date,
    },
    RepaymentDate12th: {
      type: Date,
    },
    NachRegistration: {
      type: String,
    },
    Aggregator: {
      type: String,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    Loan_End_date: {
      type: Date,
    },

    Campaign: {
      type: String,
    },

    Cases: {
      type: String,
    },

    Lender: {
      type: String,
    },
    Nach_Registration: {
      type: String,
    },

    CreatedDate: {
      type: Date,
    },
    UpdatedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);
export default mongoose.model<mongoose.Document>('approvedloans', approvedloansSchema);
