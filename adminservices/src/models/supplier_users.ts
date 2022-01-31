import mongoose from 'mongoose';

const supplierUser = new mongoose.Schema(
    {
        //user name
        Name: {
            type: String,
            trim: true,
            required: true
        },
        //user phone number
        phoneNo: {
            type: Number
        },
        //user mobile number
        mobileNo: {
            type: Number,
        },
        // type of company
        Type: {
            type: String,
        },
        ////DigiSparsh, Hospital, Vendor, Lender,
        Role: {
            type: String,
            required: true
        },
        //user address
        address: {
            type: String
        },
        // username (phone number in my case)
        username: {
            type:{Number,String} 
           
        },
        // user email 
        email: {
            type: String,
            trim: true,
            required: true
        },
        // user password
        password: {
            type: String,
            required: true
        },
        // user password 
        confirmpassword: {
            type: String,
            required: true
        },
        // ...
        emailHash: {
            type: String
        },
        // ...
        salt: {
            type: String
        },
        //user type - DigiSparsh: 1, Hospital: 2, Vendor:3, Lender:4,
        userType: {
            type: Number,
            required: true
        },
        // user gst number
        GSTNumber: {
            type: String
        },
        // user pan 
        PANNumber: {
            type: String
        },
        // user bank name
        bankName: {
            type: String
        },
        // user bank account number
        accountNumber: {
            type: String
        },
        // user bank ifsc
        IFSCCode: {
            type: String
        },
        // ...
        authorisedPersonName: {
            type: String
        },
        // ...
        contactDetailsForAuthPerson: {
            type: Number
        },
        // ...
        PANNumberForAuthPerson: {
            type: String
        },
        // ...
        relationShip: {
            type: String
        },
        //
        bankNameDisb: {
            type: String
        },
        //
        accountNumberDisb: {
            type: String
        },
        //
        IFSCCodeDisb: {
            type: String
        },
        //
        bankNameCollection: {
            type: String
        },
        //
        accountNumberCollection: {
            type: String
        },
        //
        IFSCCodeCollection: {
            type: String
        },
        // entered while creating vendor
        RateOfDeduction: {
            type: Number
        },
        // entered while creating vendor
        NoOfDaysCreditPeriod: {
            type: Number
        },
        // entered while creating vendor
        SanctionLimit: {
            type: Number
        },
        //
        Repayment: {
            type: Number
        },
        //
        UtilizedAmount: {
            type: Number
        },
        //
        AvailableLimit: {
            type: Number
        },
        // entered while creating vendor
        HospitalName: {
            type: String
        },
        // entered while creating vendor/ loan to value
        LTV: {
            type: Number
        },
        // from db 
        HospitalId: {
            type: mongoose.Schema.Types.ObjectId
        },
        // from db
        LenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        //
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
    },
    {
        timestamps: true
    },
);
export default mongoose.model<SupplierUserDoc>('Supplier_Users', supplierUser);

export interface SupplierUserDoc extends mongoose.Document {
    username: string,
    password: string,
    confirmpassword: string,
    salt: string,
    emailHash: string,


}