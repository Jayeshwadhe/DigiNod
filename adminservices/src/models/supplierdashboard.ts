
import mongoose from 'mongoose';


const SupplierAdminDashboard = new mongoose.Schema(
    {
        //dashboard

        TotalVendor: Number,
        TotalLenders: Number,
        TotalHospitals: Number,
        TotalUtilizedLimit: Number,
        TotalRepaymentCount: Number,
        TotalRepaymentsLimit: Number,
        TotalSanctionLimit: Number,
        TotalAvailableLimit: Number,
        TotalinvoicesCount: Number,
        TotalInvoicesAmount: Number,
        TotalPendingCount: Number,
        TotalPendingAmount: Number,
        TotalfundedCount: Number,
        TotalfundedPaidAmount: Number,
        TotalRejectedCount: Number,
        TotalRejectedAmount: Number,

        //graphs

        getFundedInvoiceGraphToAdmin: Object,
        getLApprovedInvoiceGraphToAdmin: Object,
        getInvoiceGraphToAdmin: Object,
        getAdminGraphOne: Object,
        getLastPieGraphForAdmin: Object,
        getSecondPieGraphForAdmin: Object,

        monthsAndYears: Object,
        All: Object,
        InProcess: Object,
        Disbursed: Object,
        Repaid: Object,
        Rejected: Object,
        TotalFunded: Object,
        UnderPaid: Object,
        OverPaid: Object,
        FullPaid: Object,
        TotalInvoices: Object,

        jobLastUpdatedOn: Date

    }
);
// addresses: [{ street: String, state: String, city: String, pinCode: Number, country: String }],


export default mongoose.model<mongoose.Document>('SupplierAdminDashboard', SupplierAdminDashboard);