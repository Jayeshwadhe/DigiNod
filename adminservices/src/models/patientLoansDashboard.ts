import mongoose from 'mongoose';
const patientLoansDashboard = new mongoose.Schema(
    {
        //dashboard
        totalUninsuredCount: Number,
        totalReimbursementCount: Number,
        totalCount: Number,
        totalAmount: Number,
        totalUninsuredAmount: Number,
        totalReimbursementAmount: Number,

        totalInProcessCount: Number,
        uninsuredInProcessCount: Number,
        reimbursementInProcessCount: Number,

        totalInProcessAmount: Number,
        uninsuredInProcessAmount: Number,
        reimbursementInProcessAmount: Number,

        totalFundedCount: Number,
        uninsuredFundedCount: Number,
        reimbursementFundedCount: Number,

        totalFundedAmount: Number,
        uninsuredFundedAmount: Number,
        reimbursementFundedAmount: Number,

        totalRepaidCount: Number,
        uninsuredRepaidCount: Number,
        reimbursementRepaidCount: Number,

        totalRepaidAmount: Number,
        uninsuredRepaidAmount: Number,
        reimbursementRepaidAmount: Number,

        totalRejectedCount: Number,
        uninsuredRejectedCount: Number,
        reimbursementRejectedCount: Number,

        totalRejectedAmount: Number,
        uninsuredRejectedAmount: Number,
        reimbursementRejectedAmount: Number,

        //graphs 
        invoiceAmountGraph: Object,
        invoiceCountGraph: Object,

        unInsuredAmountGraph: Object,
        unInsuredCountGraph: Object,
        reimbursementAmountGraph: Object,
        reimbursementCountGraph: Object,

        jobLastUpdatedOn: Date

    }
);


export default mongoose.model<mongoose.Document>('patientLoansDashboard', patientLoansDashboard);