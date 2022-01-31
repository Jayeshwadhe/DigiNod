import { StringIterator } from 'lodash';
import mongoose from 'mongoose';


const ClaimUser = new mongoose.Schema({
    
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        username: {
            type: String,
            required: true,
            trim: true,
        },

        password: {
            type: String,
            required: true
        },
        Role: {
            type: String,
            required: true
        },

        firstname: {
            type: String
        },
        lastname: {
            type: String
        },

        Name: {
            type: String
        },

        emailHash: {
            type: String
        },

        salt: {
            type: String
        },

        userType: {
            type: Number,
            required: true
        },

       

        MobileNumber: {
            type: Number
        },

        PANNumber: {
            type: String
        },

        DateofBirth: {
            type: String
        },

        Address: {
            type: String
        },
        Country: {
            type: String
        },

        State: {
            type: String
        },

        City: {
            type: String
        },

        Pincode: {
            type: String
        },

        IsBank_NBFC: {
            type: String
        },

        Bank_NBFCName: {
            type: String
        },

        CompanyName: {
            type: String
        },

        CompanyDesc: {
            type: String
        },

        TypeofCompany: {
            type: String
        },

        BusinessNature: {
            type: String
        },

        Currency: {
            type: String
        },

        Revenue: {
            type: Number
        },

        IsGSTregistered: {
            type: Boolean
        },

        GSTNumber: {
            type: String
        },

        Company_website: {
            type: String
        },

        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        LenderId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        aggregatorId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        
        RegisterednameoftheHospital: {
            type: String
        },
        CINNumber: {
            type: Number
        },
        contactPerson: {
            type: String
        },
        confirmPassword: {
            type: String,
            required: true
        },
        DateOfRegistration: {
            type: String
        },
        NameOfAggregator: {
            type: String
        },
        NoOfTPAsAssociated: {
            type: Number
        },
        NoOfDirectInsuranceCompaniesAssociated: {
            type: Number
        },
 
        ContactName: {
            type: String
        },
        Designation: {
            type: String
        },       
        NoOfClaimProcessedInAYear: {
            type: Number
        },
        TotalNoOfClaimProcessed: {
            type: Number
        },
        AverageTicketSizeOfTheClaims: {
            type: Number
        },
        DoYouHaveAnExistingWorkingCapitalLoan: {
            type: String
        },
        ExistingCreditLimit: {
            type: Number
        },
        Repayment: {
            type: Number
        },
        UtilizedAmount: {
            type: Number
        },
        AvailableLimit: {
            type: Number
        },
        AccountName: {
            type: String
        },
        AccountNumber: {
            type: Number
        },
        NameOfTheBank: {
            type: String
        },
        IFSCcode: {
            type: String
        },
        Branch: {
            type: String
        },
        /*----------------------------------Director's KYC Documents------------------------------------*/


        TotalNoOfHospital: {
            type: Number
        },
        totalValueofClaimsProcessed: {
            type: Number
        }, 
        Bank: {
            type: String
        }, 
        BankAddress: {
            type: String
        },
        PANcardDoc: {
            type: String
        },
        attachedDocuments: {
            type: String
        },
        GSTUrl: {
            type: String
        },
        AddressDocUrl: {
            type: String
        },
        RegCertificateUrl: {
            type: String
        },
        FinancialStUrl: {
            type: String
        },
        NOCextUrl: {
            type: String
        },
        TwoYearBankStUrl: {
            type: String
        },
        TwoyearTTRUrl: {
            type: String
        },
        otherUrl: {
            type: String
        },
        conDetailDirUrl: {
            type: String
        },
        KYCDocUrl: {
            type: String
        },
        ParriPassuUrl: {
            type: String
        },
        PANcardUrl: {
            type: String
        },
        AttachedDocUrl: {
            type: String
        },
        NameOfDirector: {
            type: Array,
        },
        ContactNumberOfDirector: {
            type: Array
        },
        DirectorEmail: {
            type: Array
        },
        DirectorPANNumber: {
            type: Array
        },
        AadharDocUrl: {
            type: Array
        },
        LenderLTV: {
            type: Number
        },

        AadharNumber: {
            type: Number
        },
        LenderTenure: {
            type: Number
        },
        LenderROI: {
            type: Number
        },
        LComment: {
            type: String
        },
        LStatus: {
            type: String
        },
        LenderName: {
            type: String
        },

        escrowAccountName: {
            type: String
        },
        escrowAccountNumber: {
            type: Number
        },
        escrowNameOfTheBank: {
            type: String
        },
        escrowIFSCcode: {
            type: String
        },
        escrowBranch: {
            type: String
        },

        authKey: {
            type: String
        },
        authKeyHitCount: {
            type: Number
        },
        authKeyRegDate: {
            type: Date
        },


    }, { timestamps: true }
);

export default mongoose.model<ClaimUserDoc>('Users', ClaimUser);


export interface ClaimUserDoc extends mongoose.Document {
        userId: mongoose.Schema.Types.ObjectId,
        username: string,
        password: string,
        Role: string,
        firstname: string,
        lastname: string,
        Name: string,
        emailHash: string,
        salt: string,
        userType: number,
        MobileNumber: number,
        PANNumber: string,
        DateofBirth: string,
        Address: string,
        Country: string,
        State: string,
        City: string,
        Pincode: string,
        IsBank_NBFC: string,
        Bank_NBFCName: string,
        CompanyName: string,
        CompanyDesc: string,
        TypeofCompany: string,
        BusinessNature: string,
        Currency: string,
        Revenue: string,
        IsGSTregistered: Boolean,
        GSTNumber: string,
        Company_website: string,
        hospitalId: mongoose.Schema.Types.ObjectId,
        LenderId: mongoose.Schema.Types.ObjectId,
        aggregatorId: mongoose.Schema.Types.ObjectId,
        RegisterednameoftheHospital: string,
        CINNumber: number,
        contactPerson: string,
        confirmPassword: string,
        DateOfRegistration: string,
        NameOfAggregator:string,
        NoOfTPAsAssociated: number,
        NoOfDirectInsuranceCompaniesAssociated: number,
        ContactName: string,
        Designation: string,       
        NoOfClaimProcessedInAYear: number,
        TotalNoOfClaimProcessed: number,
        AverageTicketSizeOfTheClaims: number,
        DoYouHaveAnExistingWorkingCapitalLoan: string,
        ExistingCreditLimit: number,
        Repayment: number,
        UtilizedAmount: number,
        AvailableLimit: number,
        AccountName: string,
        AccountNumber: number,
        NameOfTheBank: string,
        IFSCcode: string,
        Branch: string,
        /*----------------------------------Director's KYC Documents------------------------------------*/


        TotalNoOfHospital: number,
        totalValueofClaimsProcessed: number, 
        Bank: string, 
        BankAddress: string,
        PANcardDoc: string,
        attachedDocuments: string,
        GSTUrl: string,
        AddressDocUrl: string,
        RegCertificateUrl: string,
        FinancialStUrl: string,
        NOCextUrl: string,
        TwoYearBankStUrl: string,
        TwoyearTTRUrl: string,
        otherUrl: string,
        conDetailDirUrl: string
        KYCDocUrl: string,
        ParriPassuUrl: string,
        PANcardUrl: string,
        AttachedDocUrl: string,
        NameOfDirector: Array<Object>,
        ContactNumberOfDirector: Array<Object>,
        DirectorEmail: Array<Object>,
        DirectorPANNumber: Array<Object>,
        AadharDocUrl: Array<Object>,
        LenderLTV: number,
        AadharNumber: number,
        LenderTenure: number,
        LenderROI: number,
        LComment: string,
        LStatus: string,
        LenderName: string,
        escrowAccountName: string,
        escrowAccountNumber: number,
        escrowNameOfTheBank: string,
        escrowIFSCcode: string,
        escrowBranch: string,
        authKey: string,
        authKeyHitCount: number,
        authKeyRegDate: Date,
}

