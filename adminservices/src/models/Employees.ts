import mongoose from 'mongoose';

// const autoIncrement = require("mongoose-auto-increment");

// const database_URL = process.env.DATABASE_URL;
// mongoose.connect(database_URL);
// //mongoose.connect('mongodb://Devs:Devs%40123@103.15.67.124:27017/DigiSparshDB');
// let db = mongoose.connection;
// autoIncrement.initialize(mongoose.connection);


const EmployeeSchema = new mongoose.Schema(
    {
        Employee_name: {
            type: String,
        },
        qube_ref_id: {
            type: String,
            unique: true,
        },
        Mobile_no: {
            type: String,
        },
        EmailId: {
            type: String,
        },
        Joining_date: {
            type: Date,
        },
        Date_of_birth: {
            type: Date,
        },
        Pan_no: {
            type: String,
        },
        Aadhaar_no: {
            type: String,
        },
        Address: {
            type: String,
        },
        state: {
            type: String,
        },
        City: {
            type: String,
        },
        PinCode: {
            type: Number,
        },
        salary: {
            type: Number,
        },
        Loan_limit: {
            type: Number,
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            require: false,
            default: null,
        },
        updatedAt: {
            type: Date,
            require: false,
            default: null,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            require: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<mongoose.Document>('Employee', EmployeeSchema);

