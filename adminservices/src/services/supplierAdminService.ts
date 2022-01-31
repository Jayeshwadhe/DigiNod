import { Service, Inject } from 'typedi';
import { Request } from 'express';
import moment from 'moment';

@Service()
export default class supplierAdminService2 {
    constructor(
        @Inject('SupplierAdminDashboard') private SupplierAdminDashboardModel: Models.SupplierAdminDashboardModel,
        @Inject('SupplierInvoice') private SupplierInvoiceModel: Models.SupplierInvoiceModel,
        @Inject('SupplierUser') private SupplierUserModel: Models.SupplierUserModel,
        @Inject('logger') private logger,
    ) {
    }
    public async supplierDashboardJob(req: Request): Promise<{ dashboardData: any }> {
        try {
            //from supplier user table
            var vendors = await this.SupplierUserModel.aggregate([{
                $facet: {
                    "vendorCount": [{ $match: { Role: "Vendor" } }, { $count: "total" }],
                    "vendorDetails": [
                        { $match: { Role: "Vendor" } },
                        {
                            $group: {
                                _id: "$_v",
                                sanctionLimit: { $sum: "$SanctionLimit" },
                                utilizedAmount: { $sum: "$UtilizedAmount" },
                                availableLimit: { $sum: "$AvailableLimit" },
                                repayment: { $sum: "$Repayment" }
                            }
                        }
                    ]
                }
            }]);
            var totalVendors: Number;
            var sanctionLimit: Number;
            var utilizedAmount: Number;
            var availableLimit: Number;
            var repayment: Number;

            if (vendors[0].vendorCount[0].total != undefined) { totalVendors = vendors[0].vendorCount[0].total; } else totalVendors = 0;
            if (vendors[0].vendorDetails[0].sanctionLimit != undefined) { sanctionLimit = vendors[0].vendorDetails[0].sanctionLimit; } else sanctionLimit = 0;
            if (vendors[0].vendorDetails[0].utilizedAmount != undefined) { utilizedAmount = vendors[0].vendorDetails[0].utilizedAmount; } else utilizedAmount = 0;
            if (vendors[0].vendorDetails[0].availableLimit != undefined) { availableLimit = vendors[0].vendorDetails[0].availableLimit; } else availableLimit = 0;
            if (vendors[0].vendorDetails[0].repayment != undefined) { repayment = vendors[0].vendorDetails[0].repayment; } else repayment = 0;

            const lenders = await this.SupplierUserModel.find({ Role: "Lender" });
            var totalLenders = lenders.length
            const hospitals = await this.SupplierUserModel.find({ Role: "Hospital" });
            var totalHospitals = hospitals.length

            // from supplier invoice table
            var invoiceData = await this.SupplierInvoiceModel.aggregate([{
                $facet: {
                    "repaymentCount": [{ $match: { Status: "Repaid" } }, { $count: "total" }],
                    "invoiceCount": [{ $count: "total" }],
                    "invoiceAmount": [{ $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }],
                    "fundedCount": [{ $match: { Status: "Funded" } }, { $count: "total" }],
                    "fundedAmount": [
                        { $match: { Status: "Funded" } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "pendingCount": [{ $match: { $or: [{ Status: 'Pending' }, { Status: 'HApproved' }, { Status: 'LApproved' }] } }, { $count: "total" }],
                    "pendingAmount": [
                        { $match: { $or: [{ Status: 'Pending' }, { Status: 'HApproved' }, { Status: 'LApproved' }] } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "rejectedCount": [{ $match: { $or: [{ Status: 'HRejected' }, { Status: 'LRejected' }] } }, { $count: "total" }],
                    "rejectedAmount": [
                        { $match: { $or: [{ Status: 'HRejected' }, { Status: 'LRejected' }] } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                }
            }]);
            var repaymentCount: 0;
            var invoiceCount: 0;
            var invoiceAmount: 0;
            var fundedCount: 0;
            var fundedAmount: 0;
            var pendingCount: 0;
            var pendingAmount: 0;
            var rejectedCount: 0;
            var rejectedAmount: 0;

            if (invoiceData[0].repaymentCount[0].total != undefined) { repaymentCount = invoiceData[0].repaymentCount[0].total } else repaymentCount = 0;
            if (invoiceData[0].invoiceCount[0].total != undefined) { invoiceCount = invoiceData[0].invoiceCount[0].total } else invoiceCount = 0;
            if (invoiceData[0].invoiceAmount[0].total != undefined) { invoiceAmount = invoiceData[0].invoiceAmount[0].total } else invoiceAmount = 0;
            if (invoiceData[0].fundedCount[0].total != undefined) { fundedCount = invoiceData[0].fundedCount[0].total } else fundedCount = 0;
            if (invoiceData[0].fundedAmount[0].total != undefined) { fundedAmount = invoiceData[0].fundedAmount[0].total } else fundedAmount = 0;
            if (invoiceData[0].pendingCount[0].total != undefined) { pendingCount = invoiceData[0].pendingCount[0].total } else pendingCount = 0;
            if (invoiceData[0].pendingAmount[0].total != undefined) { pendingAmount = invoiceData[0].pendingAmount[0].total } else pendingAmount = 0;
            if (invoiceData[0].rejectedCount[0].total != undefined) { rejectedCount = invoiceData[0].rejectedCount[0].total } else rejectedCount = 0;
            if (invoiceData[0].rejectedAmount[0].total != undefined) { rejectedAmount = invoiceData[0].rejectedAmount[0].total } else rejectedAmount = 0;

            //graphs
            var date = moment.utc();
            var currentMonth = date.month() + 1; var currentMonthYear = date.year();
            var previousMonth1 = date.subtract(1, "month").month() + 1; var previousMonthYear1 = date.year();
            var previousMonth2 = date.subtract(1, "months").month() + 1; var previousMonthYear2 = date.year();
            var previousMonth3 = date.subtract(1, "months").month() + 1; var previousMonthYear3 = date.year();
            var previousMonth4 = date.subtract(1, "months").month() + 1; var previousMonthYear4 = date.year();
            var previousMonth5 = date.subtract(1, "months").month() + 1; var previousMonthYear5 = date.year();

            //Amount of Uploaded Invoices(Monthly)

            var invoiceAmount1 = 0;
            var invoiceAmount2 = 0;
            var invoiceAmount3 = 0;
            var invoiceAmount4 = 0;
            var invoiceAmount5 = 0;
            var invoiceAmount6 = 0;

            var invoiceAmountData = await this.SupplierInvoiceModel.aggregate([{
                $facet: {
                    "invoiceAmount1": [
                        { $project: { InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { month: currentMonth } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "invoiceAmount2": [
                        { $project: { InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { month: previousMonth1 } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "invoiceAmount3": [
                        { $project: { InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { month: previousMonth2 } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "invoiceAmount4": [
                        { $project: { InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { month: previousMonth3 } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "invoiceAmount5": [
                        { $project: { InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { month: previousMonth4 } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "invoiceAmount6": [
                        { $project: { InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { month: previousMonth5 } },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                }
            }])
            if (invoiceAmountData[0].invoiceAmount1[0] != undefined) { invoiceAmount1 = invoiceAmountData[0].invoiceAmount1[0].total; } else { invoiceAmount1 = 0 }
            if (invoiceAmountData[0].invoiceAmount2[0] != undefined) { invoiceAmount2 = invoiceAmountData[0].invoiceAmount2[0].total; } else { invoiceAmount2 = 0 }
            if (invoiceAmountData[0].invoiceAmount3[0] != undefined) { invoiceAmount3 = invoiceAmountData[0].invoiceAmount3[0].total; } else { invoiceAmount3 = 0 }
            if (invoiceAmountData[0].invoiceAmount4[0] != undefined) { invoiceAmount4 = invoiceAmountData[0].invoiceAmount4[0].total; } else { invoiceAmount4 = 0 }
            if (invoiceAmountData[0].invoiceAmount5[0] != undefined) { invoiceAmount4 = invoiceAmountData[0].invoiceAmount5[0].total; } else { invoiceAmount5 = 0 }
            if (invoiceAmountData[0].invoiceAmount6[0] != undefined) { invoiceAmount5 = invoiceAmountData[0].invoiceAmount6[0].total; } else { invoiceAmount6 = 0 }

            var invoiceAmountGraph = [
                [invoiceAmount1, currentMonth, currentMonthYear],
                [invoiceAmount2, previousMonth1, previousMonthYear1],
                [invoiceAmount3, previousMonth2, previousMonthYear2],
                [invoiceAmount4, previousMonth3, previousMonthYear3],
                [invoiceAmount5, previousMonth4, previousMonthYear4],
                [invoiceAmount6, previousMonth5, previousMonthYear5]
            ];

            //Overall Count Of Invoices

            var invoiceCountGraph = {
                uploaded: invoiceCount,
                inProcess: pendingCount,
                disbursed: fundedCount,
                rejected: rejectedCount
            }

            //Amount of Approved Invoices(Monthly)
            var approvedInvoiceAmount1 = 0;
            var approvedInvoiceAmount2 = 0;
            var approvedInvoiceAmount3 = 0;
            var approvedInvoiceAmount4 = 0;
            var approvedInvoiceAmount5 = 0;
            var approvedInvoiceAmount6 = 0;

            var approvedInvoiceAmountData = await this.SupplierInvoiceModel.aggregate([{
                $facet: {
                    "approvedInvoiceAmount1": [
                        { $project: { Status: 1, InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        {
                            $match: {
                                $and: [
                                    { month: currentMonth },
                                    {
                                        $or: [
                                            { Status: "LApproved" },
                                            { Status: "HApproved" },
                                            { Status: "Repaid" },
                                            { Status: "Funded" },
                                            { Status: "HRepaid" }
                                        ]
                                    }
                                ]
                            },
                        },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "approvedInvoiceAmount2": [
                        { $project: { Status: 1, InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { $and: [{ month: previousMonth1 }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "approvedInvoiceAmount3": [
                        { $project: { Status: 1, InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { $and: [{ month: previousMonth2 }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "approvedInvoiceAmount4": [
                        { $project: { Status: 1, InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { $and: [{ month: previousMonth3 }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "approvedInvoiceAmount5": [
                        { $project: { Status: 1, InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { $and: [{ month: previousMonth4 }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ],
                    "approvedInvoiceAmount6": [
                        { $project: { Status: 1, InvoiceAmount: 1, month: { $month: '$InvoiceDate' } } },
                        { $match: { $and: [{ month: previousMonth5 }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
                    ]
                }
            }]);

            if (approvedInvoiceAmountData[0].approvedInvoiceAmount1[0] != undefined) { approvedInvoiceAmount1 = approvedInvoiceAmountData[0].approvedInvoiceAmount1[0].total } else { approvedInvoiceAmount1 = 0 }
            if (approvedInvoiceAmountData[0].approvedInvoiceAmount2[0] != undefined) { approvedInvoiceAmount2 = approvedInvoiceAmountData[0].approvedInvoiceAmount2[0].total } else { approvedInvoiceAmount2 = 0 }
            if (approvedInvoiceAmountData[0].approvedInvoiceAmount3[0] != undefined) { approvedInvoiceAmount3 = approvedInvoiceAmountData[0].approvedInvoiceAmount3[0].total } else { approvedInvoiceAmount3 = 0 }
            if (approvedInvoiceAmountData[0].approvedInvoiceAmount4[0] != undefined) { approvedInvoiceAmount4 = approvedInvoiceAmountData[0].approvedInvoiceAmount4[0].total } else { approvedInvoiceAmount4 = 0 }
            if (approvedInvoiceAmountData[0].approvedInvoiceAmount5[0] != undefined) { approvedInvoiceAmount5 = approvedInvoiceAmountData[0].approvedInvoiceAmount5[0].total } else { approvedInvoiceAmount5 = 0 }
            if (approvedInvoiceAmountData[0].approvedInvoiceAmount6[0] != undefined) { approvedInvoiceAmount6 = approvedInvoiceAmountData[0].approvedInvoiceAmount6[0].total } else { approvedInvoiceAmount6 = 0 }

            var approvedInvoiceAmountGraph = [
                [approvedInvoiceAmount1, currentMonth],
                [approvedInvoiceAmount2, previousMonth1],
                [approvedInvoiceAmount3, previousMonth2],
                [approvedInvoiceAmount4, previousMonth3],
                [approvedInvoiceAmount5, previousMonth5],
                [approvedInvoiceAmount6, previousMonth5]
            ];

            // Amount of Disbursed Invoices(Monthly)
            var disbursedInvoiceAmount1 = 0;
            var disbursedInvoiceAmount2 = 0;
            var disbursedInvoiceAmount3 = 0;
            var disbursedInvoiceAmount4 = 0;
            var disbursedInvoiceAmount5 = 0;
            var disbursedInvoiceAmount6 = 0;

            var disbursedInvoiceAmountData = await this.SupplierInvoiceModel.aggregate([{
                $facet: {
                    "disbursedInvoiceAmount1": [
                        { $project: { Status: 1, LTVAmount: 1, month: { $month: '$PaymentDate' } } },
                        { $match: { $and: [{ month: currentMonth }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
                    ],
                    "disbursedInvoiceAmount2": [
                        { $project: { Status: 1, LTVAmount: 1, month: { $month: '$PaymentDate' } } },
                        { $match: { $and: [{ month: previousMonth1 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
                    ],
                    "disbursedInvoiceAmount3": [
                        { $project: { Status: 1, LTVAmount: 1, month: { $month: '$PaymentDate' } } },
                        { $match: { $and: [{ month: previousMonth2 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
                    ],
                    "disbursedInvoiceAmount4": [
                        { $project: { Status: 1, LTVAmount: 1, month: { $month: '$PaymentDate' } } },
                        { $match: { $and: [{ month: previousMonth3 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
                    ],
                    "disbursedInvoiceAmount5": [
                        { $project: { Status: 1, LTVAmount: 1, month: { $month: '$PaymentDate' } } },
                        { $match: { $and: [{ month: previousMonth4 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
                    ],
                    "disbursedInvoiceAmount6": [
                        { $project: { Status: 1, LTVAmount: 1, month: { $month: '$PaymentDate' } } },
                        { $match: { $and: [{ month: previousMonth5 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
                        { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
                    ]
                }
            }]);

            if (disbursedInvoiceAmountData[0].disbursedInvoiceAmount1[0] != undefined) { disbursedInvoiceAmount1 = disbursedInvoiceAmountData[0].disbursedInvoiceAmount1[0].total } else { disbursedInvoiceAmount1 = 0 }
            if (disbursedInvoiceAmountData[0].disbursedInvoiceAmount2[0] != undefined) { disbursedInvoiceAmount2 = disbursedInvoiceAmountData[0].disbursedInvoiceAmount2[0].total } else { disbursedInvoiceAmount2 = 0 }
            if (disbursedInvoiceAmountData[0].disbursedInvoiceAmount3[0] != undefined) { disbursedInvoiceAmount3 = disbursedInvoiceAmountData[0].disbursedInvoiceAmount3[0].total } else { disbursedInvoiceAmount3 = 0 }
            if (disbursedInvoiceAmountData[0].disbursedInvoiceAmount4[0] != undefined) { disbursedInvoiceAmount4 = disbursedInvoiceAmountData[0].disbursedInvoiceAmount4[0].total } else { disbursedInvoiceAmount4 = 0 }
            if (disbursedInvoiceAmountData[0].disbursedInvoiceAmount5[0] != undefined) { disbursedInvoiceAmount5 = disbursedInvoiceAmountData[0].disbursedInvoiceAmount5[0].total } else { disbursedInvoiceAmount5 = 0 }
            if (disbursedInvoiceAmountData[0].disbursedInvoiceAmount6[0] != undefined) { disbursedInvoiceAmount6 = disbursedInvoiceAmountData[0].disbursedInvoiceAmount6[0].total } else { disbursedInvoiceAmount6 = 0 }

            var disbursedInvoiceAmountGraph = [
                [disbursedInvoiceAmount1, currentMonth],
                [disbursedInvoiceAmount2, previousMonth1],
                [disbursedInvoiceAmount3, previousMonth2],
                [disbursedInvoiceAmount4, previousMonth3],
                [disbursedInvoiceAmount5, previousMonth5],
                [disbursedInvoiceAmount6, previousMonth5]
            ];

            //Total Repayments By Status
            var overPaid = 0
            var underPaid = 0
            var repaymentInvoiceCountData = await this.SupplierInvoiceModel.aggregate([{
                $facet: {
                    "underpaid": [
                        { $project: { Status: 1, SettleStatus: 1 } },
                        {
                            $match: {
                                $and: [{ Status: "Repaid" }, { SettleStatus: "UnderPaid" }],
                            }
                        }, { $count: "total" }],
                    "overPaid": [
                        { $project: { Status: 1, SettleStatus: 1 } },
                        {
                            $match: {
                                $and: [{ Status: "Repaid" }, { SettleStatus: "OverPaid" }],
                            }
                        }, { $count: "total" }],
                }
            }]);
            if (repaymentInvoiceCountData[0].underpaid[0] != undefined) { underPaid = repaymentInvoiceCountData[0].underpaid[0].total; } else { underPaid = 0; }
            if (repaymentInvoiceCountData[0].overPaid[0] != undefined) { overPaid = repaymentInvoiceCountData[0].overPaid[0].total; } else { overPaid = 0; }

            var repaymentGraph = {
                totalFunded: fundedCount,
                fullPaid: repaymentCount,
                underPaid: underPaid,
                overPaid: overPaid
            }

            //Total Funded Vs Non-Funded Invoices
            var fundedGraph = {
                totalFunded: fundedCount,
                nonFunded: (invoiceCount - fundedCount)
            }

            //Number of Invoices(Monthly)
            var monthlyInvoiceCountData = await this.SupplierInvoiceModel.aggregate([{
                $facet: {
                    "allInvoices1": [{ $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { month: currentMonth } }, { $count: "total" }],
                    "allInvoices2": [{ $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { month: previousMonth1 } }, { $count: "total" }],
                    "allInvoices3": [{ $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { month: previousMonth2 } }, { $count: "total" }],
                    "allInvoices4": [{ $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { month: previousMonth3 } }, { $count: "total" }],
                    "allInvoices5": [{ $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { month: previousMonth4 } }, { $count: "total" }],
                    "allInvoices6": [{ $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { month: previousMonth5 } }, { $count: "total" }],

                    "pendingInvoices1": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: currentMonth }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] }, }, { $count: "total" }],
                    "pendingInvoices2": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth1 }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] }, }, { $count: "total" }],
                    "pendingInvoices3": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth2 }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] }, }, { $count: "total" }],
                    "pendingInvoices4": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth3 }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] }, }, { $count: "total" }],
                    "pendingInvoices5": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth4 }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] }, }, { $count: "total" }],
                    "pendingInvoices6": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth5 }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] }, }, { $count: "total" }],

                    "disbursedInvoices1": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: currentMonth }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, }, { $count: "total" }],
                    "disbursedInvoices2": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth1 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, }, { $count: "total" }],
                    "disbursedInvoices3": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth2 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, }, { $count: "total" }],
                    "disbursedInvoices4": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth3 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, }, { $count: "total" }],
                    "disbursedInvoices5": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth4 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, }, { $count: "total" }],
                    "disbursedInvoices6": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth5 }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, }, { $count: "total" }],

                    "repaidInvoices1": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: currentMonth }, { Status: "Repaid" }] }, }, { $count: "total" }],
                    "repaidInvoices2": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth1 }, { Status: "Repaid" }] }, }, { $count: "total" }],
                    "repaidInvoices3": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth2 }, { Status: "Repaid" }] }, }, { $count: "total" }],
                    "repaidInvoices4": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth3 }, { Status: "Repaid" }] }, }, { $count: "total" }],
                    "repaidInvoices5": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth4 }, { Status: "Repaid" }] }, }, { $count: "total" }],
                    "repaidInvoices6": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth5 }, { Status: "Repaid" }] }, }, { $count: "total" }],

                    "rejectedInvoices1": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: currentMonth }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] }, }, { $count: "total" }],
                    "rejectedInvoices2": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth1 }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] }, }, { $count: "total" }],
                    "rejectedInvoices3": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth2 }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] }, }, { $count: "total" }],
                    "rejectedInvoices4": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth3 }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] }, }, { $count: "total" }],
                    "rejectedInvoices5": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth4 }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] }, }, { $count: "total" }],
                    "rejectedInvoices6": [{ Status: 1, $project: { month: { $month: '$InvoiceDate' } } },
                    { $match: { $and: [{ month: previousMonth5 }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] }, }, { $count: "total" }],
                }
            }
            ]
            );
            var allInvoices1 = 0;
            var allInvoices2 = 0;
            var allInvoices3 = 0;
            var allInvoices4 = 0;
            var allInvoices5 = 0;
            var allInvoices6 = 0;

            var pendingInvoices1 = 0;
            var pendingInvoices2 = 0;
            var pendingInvoices3 = 0;
            var pendingInvoices4 = 0;
            var pendingInvoices5 = 0;
            var pendingInvoices6 = 0;

            var disbursedInvoices1 = 0;
            var disbursedInvoices2 = 0;
            var disbursedInvoices3 = 0;
            var disbursedInvoices4 = 0;
            var disbursedInvoices5 = 0;
            var disbursedInvoices6 = 0;

            var repaidInvoices1 = 0;
            var repaidInvoices2 = 0;
            var repaidInvoices3 = 0;
            var repaidInvoices4 = 0;
            var repaidInvoices5 = 0;
            var repaidInvoices6 = 0;

            var rejectedInvoices1 = 0;
            var rejectedInvoices2 = 0;
            var rejectedInvoices3 = 0;
            var rejectedInvoices4 = 0;
            var rejectedInvoices5 = 0;
            var rejectedInvoices6 = 0;


            if (monthlyInvoiceCountData[0].allInvoices1[0] != undefined) { allInvoices1 = monthlyInvoiceCountData[0].allInvoices1[0].total; } else { allInvoices1 = 0; }
            if (monthlyInvoiceCountData[0].allInvoices2[0] != undefined) { allInvoices2 = monthlyInvoiceCountData[0].allInvoices2[0].total; } else { allInvoices2 = 0; }
            if (monthlyInvoiceCountData[0].allInvoices3[0] != undefined) { allInvoices3 = monthlyInvoiceCountData[0].allInvoices3[0].total; } else { allInvoices3 = 0; }
            if (monthlyInvoiceCountData[0].allInvoices4[0] != undefined) { allInvoices4 = monthlyInvoiceCountData[0].allInvoices4[0].total; } else { allInvoices4 = 0; }
            if (monthlyInvoiceCountData[0].allInvoices5[0] != undefined) { allInvoices5 = monthlyInvoiceCountData[0].allInvoices5[0].total; } else { allInvoices5 = 0; }
            if (monthlyInvoiceCountData[0].allInvoices6[0] != undefined) { allInvoices6 = monthlyInvoiceCountData[0].allInvoices6[0].total; } else { allInvoices6 = 0; }

            if (monthlyInvoiceCountData[0].pendingInvoices1[0] != undefined) { pendingInvoices1 = monthlyInvoiceCountData[0].pendingInvoices1[0].total; } else { pendingInvoices1 = 0; }
            if (monthlyInvoiceCountData[0].pendingInvoices2[0] != undefined) { pendingInvoices2 = monthlyInvoiceCountData[0].pendingInvoices2[0].total; } else { pendingInvoices2 = 0; }
            if (monthlyInvoiceCountData[0].pendingInvoices3[0] != undefined) { pendingInvoices3 = monthlyInvoiceCountData[0].pendingInvoices3[0].total; } else { pendingInvoices3 = 0; }
            if (monthlyInvoiceCountData[0].pendingInvoices4[0] != undefined) { pendingInvoices4 = monthlyInvoiceCountData[0].pendingInvoices4[0].total; } else { pendingInvoices4 = 0; }
            if (monthlyInvoiceCountData[0].pendingInvoices5[0] != undefined) { pendingInvoices5 = monthlyInvoiceCountData[0].pendingInvoices5[0].total; } else { pendingInvoices5 = 0; }
            if (monthlyInvoiceCountData[0].pendingInvoices6[0] != undefined) { pendingInvoices6 = monthlyInvoiceCountData[0].pendingInvoices6[0].total; } else { pendingInvoices6 = 0; }

            if (monthlyInvoiceCountData[0].disbursedInvoices1[0] != undefined) { disbursedInvoices1 = monthlyInvoiceCountData[0].disbursedInvoices1[0].total; } else { disbursedInvoices1 = 0; }
            if (monthlyInvoiceCountData[0].disbursedInvoices2[0] != undefined) { disbursedInvoices2 = monthlyInvoiceCountData[0].disbursedInvoices2[0].total; } else { disbursedInvoices2 = 0; }
            if (monthlyInvoiceCountData[0].disbursedInvoices3[0] != undefined) { disbursedInvoices3 = monthlyInvoiceCountData[0].disbursedInvoices3[0].total; } else { disbursedInvoices3 = 0; }
            if (monthlyInvoiceCountData[0].disbursedInvoices4[0] != undefined) { disbursedInvoices4 = monthlyInvoiceCountData[0].disbursedInvoices4[0].total; } else { disbursedInvoices4 = 0; }
            if (monthlyInvoiceCountData[0].disbursedInvoices5[0] != undefined) { disbursedInvoices5 = monthlyInvoiceCountData[0].disbursedInvoices5[0].total; } else { disbursedInvoices5 = 0; }
            if (monthlyInvoiceCountData[0].disbursedInvoices6[0] != undefined) { disbursedInvoices6 = monthlyInvoiceCountData[0].disbursedInvoices6[0].total; } else { disbursedInvoices6 = 0; }

            if (monthlyInvoiceCountData[0].repaidInvoices1[0] != undefined) { repaidInvoices1 = monthlyInvoiceCountData[0].repaidInvoices1[0].total; } else { repaidInvoices1 = 0; }
            if (monthlyInvoiceCountData[0].repaidInvoices2[0] != undefined) { repaidInvoices2 = monthlyInvoiceCountData[0].repaidInvoices2[0].total; } else { repaidInvoices2 = 0; }
            if (monthlyInvoiceCountData[0].repaidInvoices3[0] != undefined) { repaidInvoices3 = monthlyInvoiceCountData[0].repaidInvoices3[0].total; } else { repaidInvoices3 = 0; }
            if (monthlyInvoiceCountData[0].repaidInvoices4[0] != undefined) { repaidInvoices4 = monthlyInvoiceCountData[0].repaidInvoices4[0].total; } else { repaidInvoices4 = 0; }
            if (monthlyInvoiceCountData[0].repaidInvoices5[0] != undefined) { repaidInvoices5 = monthlyInvoiceCountData[0].repaidInvoices5[0].total; } else { repaidInvoices5 = 0; }
            if (monthlyInvoiceCountData[0].repaidInvoices6[0] != undefined) { repaidInvoices6 = monthlyInvoiceCountData[0].repaidInvoices6[0].total; } else { repaidInvoices6 = 0; }

            if (monthlyInvoiceCountData[0].rejectedInvoices1[0] != undefined) { rejectedInvoices1 = monthlyInvoiceCountData[0].rejectedInvoices1[0].total; } else { rejectedInvoices1 = 0; }
            if (monthlyInvoiceCountData[0].rejectedInvoices2[0] != undefined) { rejectedInvoices2 = monthlyInvoiceCountData[0].rejectedInvoices2[0].total; } else { rejectedInvoices2 = 0; }
            if (monthlyInvoiceCountData[0].rejectedInvoices3[0] != undefined) { rejectedInvoices3 = monthlyInvoiceCountData[0].rejectedInvoices3[0].total; } else { rejectedInvoices3 = 0; }
            if (monthlyInvoiceCountData[0].rejectedInvoices4[0] != undefined) { rejectedInvoices4 = monthlyInvoiceCountData[0].rejectedInvoices4[0].total; } else { rejectedInvoices4 = 0; }
            if (monthlyInvoiceCountData[0].rejectedInvoices5[0] != undefined) { rejectedInvoices5 = monthlyInvoiceCountData[0].rejectedInvoices5[0].total; } else { rejectedInvoices5 = 0; }
            if (monthlyInvoiceCountData[0].rejectedInvoices6[0] != undefined) { rejectedInvoices6 = monthlyInvoiceCountData[0].rejectedInvoices6[0].total; } else { rejectedInvoices6 = 0; }

            var monthlyInvoiceCountGraph = {
                all: [
                    [allInvoices1, currentMonth, currentMonthYear],
                    [allInvoices2, previousMonth1, previousMonthYear1],
                    [allInvoices3, previousMonth2, previousMonthYear2],
                    [allInvoices4, previousMonth3, previousMonthYear3],
                    [allInvoices5, previousMonth4, previousMonthYear4],
                    [allInvoices6, previousMonth5, previousMonthYear5]
                ],
                InProcess: [
                    [pendingInvoices1, currentMonth, currentMonthYear],
                    [pendingInvoices2, previousMonth1, previousMonthYear1],
                    [pendingInvoices3, previousMonth2, previousMonthYear2],
                    [pendingInvoices4, previousMonth3, previousMonthYear3],
                    [pendingInvoices5, previousMonth4, previousMonthYear4],
                    [pendingInvoices6, previousMonth5, previousMonthYear5]
                ],
                Disbursed: [
                    [disbursedInvoices1, currentMonth, currentMonthYear],
                    [disbursedInvoices2, previousMonth1, previousMonthYear1],
                    [disbursedInvoices3, previousMonth2, previousMonthYear2],
                    [disbursedInvoices4, previousMonth3, previousMonthYear3],
                    [disbursedInvoices5, previousMonth4, previousMonthYear4],
                    [disbursedInvoices6, previousMonth5, previousMonthYear5]
                ],
                Repaid: [
                    [repaidInvoices1, currentMonth, currentMonthYear],
                    [repaidInvoices2, previousMonth1, previousMonthYear1],
                    [repaidInvoices3, previousMonth2, previousMonthYear2],
                    [repaidInvoices4, previousMonth3, previousMonthYear3],
                    [repaidInvoices5, previousMonth4, previousMonthYear4],
                    [repaidInvoices6, previousMonth5, previousMonthYear5]
                ],
                Rejected: [
                    [rejectedInvoices1, currentMonth, currentMonthYear],
                    [rejectedInvoices2, previousMonth1, previousMonthYear1],
                    [rejectedInvoices3, previousMonth2, previousMonthYear2],
                    [rejectedInvoices4, previousMonth3, previousMonthYear3],
                    [rejectedInvoices5, previousMonth4, previousMonthYear4],
                    [rejectedInvoices6, previousMonth5, previousMonthYear5]
                ]
            }

            var dashboardData = {
                TotalVendor: totalVendors,
                TotalLenders: totalLenders,
                TotalHospitals: totalHospitals,
                TotalUtilizedLimit: utilizedAmount,
                TotalRepaymentsLimit: repayment,
                TotalSanctionLimit: sanctionLimit,
                TotalAvailableLimit: availableLimit,
                TotalRepaymentCount: repaymentCount,
                TotalInvoicesCount: invoiceCount,
                TotalInvoicesAmount: invoiceAmount,
                TotalPendingCount: pendingCount,
                TotalPendingAmount: pendingAmount,
                TotalFundedCount: fundedCount,
                TotalFundedAmount: fundedAmount,
                TotalRejectedCount: rejectedCount,
                TotalRejectedAmount: rejectedAmount,
                invoiceAmountGraph: invoiceAmountGraph,
                invoiceCountGraph: invoiceCountGraph,
                approvedInvoiceAmountGraph: approvedInvoiceAmountGraph,
                disbursedInvoiceAmountGraph: disbursedInvoiceAmountGraph,
                repaymentGraph: repaymentGraph,
                fundedGraph: fundedGraph,
                monthlyInvoiceCountGraph: monthlyInvoiceCountGraph
            }

            return { dashboardData };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}