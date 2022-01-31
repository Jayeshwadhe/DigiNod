import { IUser } from '@/interfaces/IUser';
import mongoose, { ObjectId } from 'mongoose';

const User = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    password: String,

    salt: String,
    // 0: read only , 1: write
    accessControl: {
      type: Number,
      enum: [0, 1],
      // required: true,
    },

    role: {
      type: String,
      enum: ['Admin', 'Hospital', 'Lender', 'Vendor', 'Aggregator', 'Validator'],
      required: [true, 'Please enter a role'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationSchema'
    },

    testUser: {
      type: Boolean
    },

    lastLogin: {
      type: Date
    },

    passwordUpdatedOn: {
      type: Date
    },

    mobileNumber: Number,

    address: [{ street: String, state: String, city: String, pinCode: Number, country: String }],


    isSplit: {
      type: Boolean,
      default: false,
    },
    updatedAt: Date,

    createdAt: Date,

    isActive: Boolean,

    isDeleted: Boolean,

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },

    VendorType: {
      type: String
    },
    GSTNumber: {
      type: String
    },
    PANNumber: {
      type: String
    },
    bankName: {
      type: String
    },
    AccountNumber: {
      type: String
    },
    IFSCcode: {
      type: String
    },
    authorisedPersonName: {
      type: String
    },
    contactDetailsForAuthPerson: {
      type: Number
    },
    PANNumberForAuthPerson: {
      type: String
    },
    relationShip: {
      type: String
    },
    bankNameDisb: {
      type: String
    },
    accountNumberDisb: {
      type: String
    },
    IFSCCodeDisb: {
      type: String
    },
    bankNameCollection: {
      type: String
    },
    accountNumberCollection: {
      type: String
    },
    IFSCCodeCollection: {
      type: String
    },
    RateOfDeduction: {
      type: Number
    },
    NoOfDaysCreditPeriod: {
      type: Number
    },
    SanctionLimit: {
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
    HospitalName: {
      type: String
    },
    LTV: {
      type: Number
    },
    HospitalId: {
      type: mongoose.Schema.Types.ObjectId
    },
    LenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users'
    },
    LenderName: {
      type: String
    },
    KycDocument: {
      type: String
    },
    Other: {
      type: String
    },
    ParriPassu: {
      type: String
    },
    LastTwoYrBank: {
      type: String
    },
    LastAudFin: {
      type: String
    },
    LastTwoFin: {
      type: String
    },
    RegCert: {
      type: String
    },
    GstCert: {
      type: String
    },
    AddrProof: {
      type: String
    },
    Visibility: {
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
    // patient user details
    NameOfTheOrganisation: {
      type: String
    },
    NameOfTheCEO: {
      type: String
    },
    ContactNoOfTheCEO: {
      type: Number
    },
    EmailIdOfTheCEO: {
      type: String
    },
    NameOfTheContactPersonSPOC: {
      type: String
    },
    ContactNoOfTheSPOC: {
      type: Number
    },
    EmailIdOfTheSPOC: {
      type: String
    },
    CINNoOfTheAggregator: {
      type: String
    },
    NatureOfBusinessOfAggregator: {
      type: String
    },
    uploadPANDoc: {
      type: String,
    },
    // claim user details
    DateofBirth: {
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

    // GSTNumber: {
    //     type: String
    // },

    Company_website: {
      type: String
    },

    // hospitalId: {
    //     type: mongoose.Schema.Types.ObjectId,
    // },
    // LenderId: {
    //     type: mongoose.Schema.Types.ObjectId,
    // },

    aggregatorId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    RegisterednameoftheHospital: {
      type: String
    },
    CINNumber: {
      type: String
    },
    contactPerson: {
      type: String
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
    noOfICompAsd: {
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
    // Repayment: {
    //     type: Number
    // },
    // UtilizedAmount: {
    //     type: Number
    // },
    // AvailableLimit: {
    //     type: Number
    // },
    AccountName: {
      type: String
    },
    // AccountNumber: {
    //     type: Number
    // },
    NameOfTheBank: {
      type: String
    },
    // IFSCcode: {
    //     type: String
    // },
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
      type: String,
    },
    ContactNumberOfDirector: {
      type: String
    },
    DirectorEmail: {
      type: String
    },
    DirectorPANNumber: {
      type: String
    },
    AadharDocUrl: {
      type: String
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
    // LenderName: {
    //     type: String
    // },

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

    ROIForAggregator: {
      type: Number,
      default : null,
      required : false
    },

    // authKey: {
    //     type: String
    // },
    // authKeyHitCount: {
    //     type: Number
    // },
    // authKeyRegDate: {
    //     type: Date
    // },
  },
  { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);

export interface UserDoc extends mongoose.Document {
  name: string,
  role: string,
  organization: string,
  address: string
  confirmPassword: string,
  password: string,
  emailHash: string,
  mobileNumber: number,
  organizationId: ObjectId,
  organizationName: string
}