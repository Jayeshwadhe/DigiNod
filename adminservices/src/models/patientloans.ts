import mongoose from 'mongoose';

const patientLoansSchema = new mongoose.Schema(
    {
        PartnerName: {
            type: String
        },
        FullName: {
            type: String
        },
        type: {
            type: String
        },
        HospitalName: {
            type: String,
        },
        // ApplicantsAadhaarNo: {
        //     type: String
        // },
        DateOfBirth: {
            type: String
        },
        BankAssociated: {
            type: String,
        },
        Occupation: {
            type: String
        },
        CurrentAddress: {
            type: String
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
        loanAmount: {
            type: Number
        },
        uploadAadharDoc: {
            type: String,
        },
        uploadPANDoc: {
            type: String,
        },
        uploadHospitalBillDoc: {
            type: String,
        },
        FinalBilluploadDoc: {
            type: String,
        },
        ProofuploadDoc: {
            type: String,
        },
        Pincode: {
            type: String
        },
        MobileNumber: {
            type: String,
        },
        EmailId: {
            type: String
        },
        // LoanAmount: {
        //     type: Number
        // },
        Scheme: {
            type: String,
        },
        // ReferenceName: {
        //     type: String
        // },
        ContactNumber: {
            type: Number
        },
        // //String
        Interest: {
            type: String
        },
        ProcessingFees: {
            type: String
        },
        borrower_name: {
            type: String
        },
        // EMIAmount: {
        //     type: Number
        // },
        // ROI: {
        //     type: String
        // },
        //For Disbursment 
        AccountNumber: {
            type: String
        },
        //For Repaymnet 
        // AccountNumberForSBI: {
        //     type: String
        // },
        // District: {
        //     type: String
        // },
        Branch: {
            type: String
        },
        IFSCCode: {
            type: String
        },
        // AccountHolderName: {
        //     type: String
        // },
        ApproveOrReject: {
            type: String
        },
        valueChanged: {
            type: String
        },
        uploadIncomeDoc: {
            type: String
        },
        bankStatementDoc: {
            type: String
        },
        PatientName: {
            type: String
        },
        Relation: {
            type: String
        },
        PanNo: {
            type: String
        },
        AadharNo: {
            type: String
        },
        PermanentAddress: {
            type: String
        },
        CompanyName: {
            type: String
        },
        TotalIncome: {
            type: Number
        },
        ReferenceName: {
            type: String
        },
        ContactNumberReferencePerson: {
            type: Number
        },
        Relationship: {
            type: String
        },

        EmailIdReferencePerson: {
            type: String
        },
        uploadCancelledCheque: {
            type: String
        },

        InsurancepolicyDoc: {
            type: String
        },
        uploadDoc: {
            type: String
        },

        CreatedDate: {
            type: String
        },
        UpdatedDate: {
            type: String
        },

    },
    {
        timestamps: true
    },

);
export default mongoose.model<mongoose.Document>('patientloans', patientLoansSchema);