import mongoose from 'mongoose';

const MerchantAdminDashboard = new mongoose.Schema(
    {
        // dashboard
        resDashboard: Object,
        Totalinvoices: Number,
        TotalClaimsUploaded: Number,
        Totalpendinginvoices: Number,
        TotalLoansInProcess: Number,
        TotalRejectedinvoices: Number,
        TotalRejectedLoans: Number,
        TotalDisbursedInvoice: Number,
        TotalDisbursedLoanamount: Number,
        repaidLenth: Number,

        // graphs
        disbursedGraphRes: Object,
        resDisbursedGraphAmountToMerchant: Object,
        resRejectedGraphToMerchant: Object,
        resInProcessGraphToMerchant: Object,

        jobLastUpdatedOn: Date
    }
);

export default mongoose.model<mongoose.Document>('MerchantAdminDashboard', MerchantAdminDashboard);