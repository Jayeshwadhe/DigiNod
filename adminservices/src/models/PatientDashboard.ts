import mongoose from 'mongoose';

const PatientAdminDashboard = new mongoose.Schema(
    {
        // dashboard
        resPatientDashboard: Object,

        Totalinvoices: Number,
        TotalClaimsUploaded: Number,
        Totalpendinginvoices: Number,
        TotalLoansInProcess: Number,
        TotalRejectedinvoices: Number,
        TotalRejectedLoans: Number,
        TotalDisbursedInvoice: Number,
        TotalDisbursedLoanamount: Number,
        repaidLenth: Number,

        getDisbursedGraphToPatient: Object,
        getDisbursedGraphAmountToPatient: Object,
        getRejectedGraphToPatient: Object,

        jobLastUpdatedOn: Date

    }
);

export default mongoose.model<mongoose.Document>('PatientAdminDashboard', PatientAdminDashboard);