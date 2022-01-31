import mongoose from 'mongoose';

// const autoIncrement = require('mongoose-auto-increment');

// const database_URL = process.env.DATABASE_URL;
// mongoose.connect(database_URL);
// //mongoose.connect('mongodb://Devs:Devs%40123@103.15.67.124:27017/DigiSparshDB');
// let db = mongoose.connection;
// autoIncrement.initialize(mongoose.connection);

const repaymentSchema = new mongoose.Schema({

    LL_Code: {
        type: String
    },
    Customer_Name: {
        type: String
    },
    Customer_Mobile: {
        type: String
    },
    Disbursement_Date: {
        type: Date
    },
    Total_EMI_Amt: {
        type: Number
    },
    EMI_Date: {
        type: Date
    },
    Actual_Date_of_Repayment: {
        type: Date
    },
    Actual_Repayment_Amt_Received: {
        type: Number
    },
    Loan_Amount: {
        type: Number
    },
    EMI_scheme: {
        type: String
    },

}, {
    timestamps: true
});



export default mongoose.model<mongoose.Document>('repayment', repaymentSchema);

