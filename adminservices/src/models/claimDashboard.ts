
import mongoose from 'mongoose';

const ClaimAdminDashboard = new mongoose.Schema(
    {
        //dashboard

        TotalNumberOfAggregator: Number,
        TotalNumberOfLender: Number,
        TotalNumberOfHospital: Number,
        UtilizedAmount: Number,
        repaidInvoiceCount: Number,
        Repayment: Number,
        TotalAvailableLimit: Number,
        TotalCreditLimit: Number,
        Totalinvoices: Number,
        TotalInvoicesClaimAmount: Number,
        Totalpendinginvoices: Number,
        TotalPendingClaimAmount: Number,
        TotalfundedInvoices: Number,
        TotalFundedClaimamount: Number,
        TotalRejectedinvoices: Number,
        TotalRejectedClaimAmount: Number,

        //graphs

        getInvoiceGraphToAdmin: Object,

        getAdminGraphOne: Object,

        getAdminGraphAmount: Object,

        getSecondPieGraphForAdmin: Object,

        jobLastUpdatedOn: Date
    }
);

export default mongoose.model<mongoose.Document>('ClaimAdminDashboard', ClaimAdminDashboard)