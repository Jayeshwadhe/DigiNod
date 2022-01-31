import { Service, Inject } from "typedi";
import { Request } from 'express';

@Service()
export default class claimDashboardService {
    constructor(
        @Inject('ClaimDashboard') private ClaimDashboardModel: Models.ClaimDashboardModel,
        @Inject('ClaimInvoice') private ClaimInvoiceModel: Models.ClaimInvoiceModel,
        @Inject('ClaimUser') private ClaimUserModel: Models.ClaimUserModel,
        @Inject('logger') private logger,
    ) {

    }

    public async getCDash(req: Request): Promise<{ data: any }> {
        try {
            const userRecord = await this.ClaimDashboardModel.find({}).sort({ jobLastUpdatedOn: -1 }).limit(1)
            var data = userRecord
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async claimDashboardJob(req: Request): Promise<{ dashboardData: any }> {
        try {

            //getDashboardForAdmin
            this.ClaimUserModel.find({})

            const Aggregatorinvoices = await this.ClaimUserModel.find({
                $and: [{ userType: 3 }, { Role: "Aggregator" }],
            });
            if (Aggregatorinvoices) {
                var TotalNumberOfAggregator = Aggregatorinvoices.length;
            }
            const Lenderinvoices = await this.ClaimUserModel.find({
                $and: [{ userType: 4 }, { Role: "Lender" }],
            });
            if (Lenderinvoices) {
                var TotalNumberOfLender = Lenderinvoices.length;
            }
            const Hospitalinvoices = await this.ClaimUserModel.find({
                $and: [{ userType: 2 }, { Role: "Hospital" }],
            });
            if (Hospitalinvoices) {
                var TotalNumberOfHospital = Hospitalinvoices.length;
            }
            var ExistingCreditLimit = 0;
            var AvailableLimit = 0;
            var UtilizedAmount = 0;
            var Repayment = 0;

            for (let i = 0; i < TotalNumberOfHospital; i++) {
                if (Hospitalinvoices) {
                    var Existing = Hospitalinvoices[i].ExistingCreditLimit;
                    if (Existing) {
                        ExistingCreditLimit = ExistingCreditLimit + Existing;
                    }

                    var Available = Hospitalinvoices[i].AvailableLimit;
                    if (Available) {
                        AvailableLimit = AvailableLimit + Available;
                    }
                    var Utilized = Hospitalinvoices[i].UtilizedAmount;
                    if (Utilized) {
                        UtilizedAmount = UtilizedAmount + Utilized;
                    }
                    var Repay = Hospitalinvoices[i].Repayment;
                    if (Repay) {
                        Repayment = Repayment + Repay;
                    }
                }
            }
            const invoicedata = await this.ClaimInvoiceModel.find();

            if (invoicedata) {
                var Totalinvoices = invoicedata.length;
                var TotalInvoicesClaimAmount = 0;
                for (let i = 0; i < Totalinvoices; i++) {
                    var PendingAmount = invoicedata[i].claimAmount;
                    if (PendingAmount) {
                        TotalInvoicesClaimAmount =
                            TotalInvoicesClaimAmount + PendingAmount;
                    }
                }
            }

            const penddata = await this.ClaimInvoiceModel.find({
                $or: [
                    { Status: "Pending" },
                    { Status: "Validated" },
                    { Status: "DApproved" },
                    { Status: "LApproved" },
                ],
            });
            if (penddata) {
                var Totalpendinginvoices = penddata.length;

                var TotalPendingClaimAmount = 0;

                for (let i = 0; i < Totalpendinginvoices; i++) {
                    var PendAmount = penddata[i].claimAmount;
                    if (PendAmount) {
                        TotalPendingClaimAmount = TotalPendingClaimAmount + PendAmount;
                    }
                }
            }

            const Rjectdata = await this.ClaimInvoiceModel.find({
                $or: [
                    { Status: "VRejected" },
                    { Status: "DRejected" },
                    { Status: "LRejected" },
                ],
            });

            if (Rjectdata) {
                var TotalRejectedinvoices = Rjectdata.length;

                var TotalRejectedClaimAmount = 0;

                for (let k = 0; k < TotalRejectedinvoices; k++) {
                    var VRejectedAmount = Rjectdata[k].claimAmount;
                    if (VRejectedAmount) {
                        TotalRejectedClaimAmount =
                            TotalRejectedClaimAmount + VRejectedAmount;
                    }
                }
            }

            const Invoicedata = await this.ClaimInvoiceModel.find({ Status: "Funded" });
            var TotalApprovalAmount = 0;
            var TotalFundedClaimamount = 0;
            if (Invoicedata) {
                var fundedInvoiceLength = Invoicedata.length;
                for (let i = 0; i < fundedInvoiceLength; i++) {
                    var FundedClaimamount = Invoicedata[i].claimAmount;
                    if (FundedClaimamount) {
                        TotalFundedClaimamount =
                            TotalFundedClaimamount + FundedClaimamount;
                    }
                }
            }
            const repaidInvoices = await this.ClaimInvoiceModel.find({ RepaidStatus: "Repaid" });
            var TotalRepaidAmount = 0;
            if (repaidInvoices) {
                var repaidLenth = repaidInvoices.length;
            }
            // return res.status(Created).json({
            //     success: true,
            //     TotalNumberOfAggregator,
            //     TotalNumberOfLender,
            //     TotalNumberOfHospital,
            //     UtilizedAmount: UtilizedAmount,
            //     repaidInvoiceCount: repaidLenth,
            //     Repayment: Repayment,
            //     TotalAvailableLimit: AvailableLimit,
            //     TotalCreditLimit: ExistingCreditLimit,
            //     Totalinvoices: Totalinvoices,
            //     TotalInvoicesClaimAmount: TotalInvoicesClaimAmount,
            //     Totalpendinginvoices: Totalpendinginvoices,
            //     TotalPendingClaimAmount: TotalPendingClaimAmount,
            //     TotalfundedInvoices: fundedInvoiceLength,
            //     TotalFundedClaimamount: TotalFundedClaimamount,
            //     TotalRejectedinvoices: TotalRejectedinvoices,
            //     TotalRejectedClaimAmount: TotalRejectedClaimAmount,
            // });

            //getInvoiceGraphToAdmin

            var countInvoice = 0;
            var countInProcess = 0;
            var countDisbursed = 0;
            var countRejected = 0;
            // var repaidInvoices = 0;
            var sum6 = 0;
            var forcalc = new Date();
            var thismonth = forcalc.getMonth() + 1;
            var t = forcalc.getFullYear();
            var this1 = new Date(t, thismonth - 1, 1);

            var month1 = forcalc.getMonth();
            if (month1 <= 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);

            var month2 = forcalc.getMonth() - 1;
            if (month2 <= 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 <= 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 <= 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 <= 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);

            var todaydate = new Date();

            var countone = await this.ClaimInvoiceModel.aggregate([
                {
                    $facet: {
                        sumone: [
                            { $match: { createdAt: { $gte: d1m5, $lte: todaydate } } },
                            { $count: "total" },
                        ],
                        sumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: todaydate } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                                { Status: "Validated" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        sumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: todaydate } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        sumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: todaydate } },
                                        {
                                            $or: [
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                                { Status: "VRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        sumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: todaydate } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                    },
                },
            ]);

            if (countone[0].sumone[0] != undefined) {
                countInvoice = countone[0].sumone[0].total;
            } else {
                countInvoice = 0;
            }
            if (countone[0].sumtwo[0] != undefined) {
                countInProcess = countone[0].sumtwo[0].total;
            } else {
                countInProcess = 0;
            }
            if (countone[0].sumthree[0] != undefined) {
                countDisbursed = countone[0].sumthree[0].total;
            } else {
                countDisbursed = 0;
            }
            if (countone[0].sumfour[0] != undefined) {
                countRejected = countone[0].sumfour[0].total;
            } else {
                countRejected = 0;
            }
            // if (countone[0].sumfour[0] != undefined) {
            //     repaidInvoices = countone[0].sumfour[0].total;
            // } else {
            //     repaidInvoices = 0;
            // }

            var getInvoiceGraphToAdmin = {
              Totalinvoicescount: countInvoice,
              TotalcountInProcess: countInProcess,
              TotalcountDisbursed: countDisbursed,
              TotalcountRejected: countRejected,
              TotalcountRepaid: repaidLenth,
            };

            //getAdminGraphOne


            var sum1 = 0;
            var sum2 = 0;
            var sum3 = 0;
            var sum4 = 0;
            var sum5 = 0;
            var sum6 = 0;

            var InProcesssum1 = 0;
            var InProcesssum2 = 0;
            var InProcesssum3 = 0;
            var InProcesssum4 = 0;
            var InProcesssum5 = 0;
            var InProcesssum6 = 0;

            var Disbursedsum1 = 0;
            var Disbursedsum2 = 0;
            var Disbursedsum3 = 0;
            var Disbursedsum4 = 0;
            var Disbursedsum5 = 0;
            var Disbursedsum6 = 0;

            var Repaidsum1 = 0;
            var Repaidsum2 = 0;
            var Repaidsum3 = 0;
            var Repaidsum4 = 0;
            var Repaidsum5 = 0;
            var Repaidsum6 = 0;

            var Rejectedsum1 = 0;
            var Rejectedsum2 = 0;
            var Rejectedsum3 = 0;
            var Rejectedsum4 = 0;
            var Rejectedsum5 = 0;
            var Rejectedsum6 = 0;

            var forcalc = new Date();
            var thismonth = forcalc.getMonth() + 1;
            var t = forcalc.getFullYear();
            var this1 = new Date(t, thismonth - 1, 1);

            var month1 = forcalc.getMonth();
            if (month1 <= 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);

            var month2 = forcalc.getMonth() - 1;
            if (month2 <= 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 <= 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 <= 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 <= 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);

            var todaydate = new Date();

            var countone = await this.ClaimInvoiceModel.aggregate([
                {
                    $facet: {
                        sumone: [
                            { $match: { createdAt: { $gte: this1, $lte: todaydate } } },
                            { $count: "total" },
                        ],
                        sumtwo: [
                            { $match: { createdAt: { $gte: d1m1, $lte: laster1 } } },
                            { $count: "total" },
                        ],
                        sumthree: [
                            { $match: { createdAt: { $gte: d1m2, $lte: laster2 } } },
                            { $count: "total" },
                        ],
                        sumfour: [
                            { $match: { createdAt: { $gte: d1m3, $lte: laster3 } } },
                            { $count: "total" },
                        ],
                        sumfive: [
                            { $match: { createdAt: { $gte: d1m4, $lte: laster4 } } },
                            { $count: "total" },
                        ],
                        sumsix: [
                            { $match: { createdAt: { $gte: d1m5, $lte: laster5 } } },
                            { $count: "total" },
                        ],

                        InProsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        InProsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        InProsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        InProsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        InProsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        InProsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],

                        Disbursedsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Disbursedsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Disbursedsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Disbursedsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Disbursedsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Disbursedsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],

                        Repaidsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Repaidsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Repaidsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Repaidsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Repaidsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Repaidsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],

                        Rejectedsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Rejectedsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Rejectedsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Rejectedsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Rejectedsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                        Rejectedsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                    },
                },
            ]);

            if (countone[0].sumone[0] != undefined) {
                sum1 += countone[0].sumone[0].total;
            } else {
                sum1 += 0;
            }
            if (countone[0].sumtwo[0] != undefined) {
                sum2 += countone[0].sumtwo[0].total;
            } else {
                sum2 += 0;
            }
            if (countone[0].sumthree[0] != undefined) {
                sum3 += countone[0].sumthree[0].total;
            } else {
                sum3 += 0;
            }
            if (countone[0].sumfour[0] != undefined) {
                sum4 += countone[0].sumfour[0].total;
            } else {
                sum4 += 0;
            }
            if (countone[0].sumfive[0] != undefined) {
                sum5 += countone[0].sumfive[0].total;
            } else {
                sum5 += 0;
            }
            if (countone[0].sumsix[0] != undefined) {
                sum6 += countone[0].sumsix[0].total;
            } else {
                sum6 += 0;
            }

            if (countone[0].InProsumone[0] != undefined) {
                InProcesssum1 += countone[0].InProsumone[0].total;
            } else {
                InProcesssum1 += 0;
            }
            if (countone[0].InProsumtwo[0] != undefined) {
                InProcesssum2 += countone[0].InProsumtwo[0].total;
            } else {
                InProcesssum2 += 0;
            }
            if (countone[0].InProsumthree[0] != undefined) {
                InProcesssum3 += countone[0].InProsumthree[0].total;
            } else {
                InProcesssum3 += 0;
            }
            if (countone[0].InProsumfour[0] != undefined) {
                InProcesssum4 += countone[0].InProsumfour[0].total;
            } else {
                InProcesssum4 += 0;
            }
            if (countone[0].InProsumfive[0] != undefined) {
                InProcesssum5 += countone[0].InProsumfive[0].total;
            } else {
                InProcesssum5 += 0;
            }
            if (countone[0].InProsumsix[0] != undefined) {
                InProcesssum6 += countone[0].InProsumsix[0].total;
            } else {
                InProcesssum6 += 0;
            }

            if (countone[0].Disbursedsumone[0] != undefined) {
                Disbursedsum1 += countone[0].Disbursedsumone[0].total;
            } else {
                Disbursedsum1 += 0;
            }
            if (countone[0].Disbursedsumtwo[0] != undefined) {
                Disbursedsum2 += countone[0].Disbursedsumtwo[0].total;
            } else {
                Disbursedsum2 += 0;
            }
            if (countone[0].Disbursedsumthree[0] != undefined) {
                Disbursedsum3 += countone[0].Disbursedsumthree[0].total;
            } else {
                Disbursedsum3 += 0;
            }
            if (countone[0].Disbursedsumfour[0] != undefined) {
                Disbursedsum4 += countone[0].Disbursedsumfour[0].total;
            } else {
                Disbursedsum4 += 0;
            }
            if (countone[0].Disbursedsumfive[0] != undefined) {
                Disbursedsum5 += countone[0].Disbursedsumfive[0].total;
            } else {
                Disbursedsum5 += 0;
            }
            if (countone[0].Disbursedsumsix[0] != undefined) {
                Disbursedsum6 += countone[0].Disbursedsumsix[0].total;
            } else {
                Disbursedsum6 += 0;
            }

            if (countone[0].Repaidsumone[0] != undefined) {
                Repaidsum1 += countone[0].Repaidsumone[0].total;
            } else {
                Repaidsum1 += 0;
            }
            if (countone[0].Repaidsumtwo[0] != undefined) {
                Repaidsum2 += countone[0].Repaidsumtwo[0].total;
            } else {
                Repaidsum2 += 0;
            }
            if (countone[0].Repaidsumthree[0] != undefined) {
                Repaidsum3 += countone[0].Repaidsumthree[0].total;
            } else {
                Repaidsum3 += 0;
            }
            if (countone[0].Repaidsumfour[0] != undefined) {
                Repaidsum4 += countone[0].Repaidsumfour[0].total;
            } else {
                Repaidsum4 += 0;
            }
            if (countone[0].Repaidsumfive[0] != undefined) {
                Repaidsum5 += countone[0].Repaidsumfive[0].total;
            } else {
                Repaidsum5 += 0;
            }
            if (countone[0].Repaidsumsix[0] != undefined) {
                Repaidsum6 += countone[0].Repaidsumsix[0].total;
            } else {
                Repaidsum6 += 0;
            }

            if (countone[0].Rejectedsumone[0] != undefined) {
                Rejectedsum1 += countone[0].Rejectedsumone[0].total;
            } else {
                Rejectedsum1 += 0;
            }
            if (countone[0].Rejectedsumtwo[0] != undefined) {
                Rejectedsum2 += countone[0].Rejectedsumtwo[0].total;
            } else {
                Rejectedsum2 += 0;
            }
            if (countone[0].Rejectedsumthree[0] != undefined) {
                Rejectedsum3 += countone[0].Rejectedsumthree[0].total;
            } else {
                Rejectedsum3 += 0;
            }
            if (countone[0].Rejectedsumfour[0] != undefined) {
                Rejectedsum4 += countone[0].Rejectedsumfour[0].total;
            } else {
                Rejectedsum4 += 0;
            }
            if (countone[0].Rejectedsumfive[0] != undefined) {
                Rejectedsum5 += countone[0].Rejectedsumfive[0].total;
            } else {
                Rejectedsum5 += 0;
            }
            if (countone[0].Rejectedsumsix[0] != undefined) {
                Rejectedsum6 += countone[0].Rejectedsumsix[0].total;
            } else {
                Rejectedsum6 += 0;
            }

            var getAdminGraphOne = {
                monthsAndYears: [
                    [thismonth, t],
                    [month1, a],
                    [month2, b],
                    [month3, c],
                    [month4, d],
                    [month5, e],
                ],
                All: [sum1, sum2, sum3, sum4, sum5, sum6],
                InProcess: [
                    InProcesssum1,
                    InProcesssum2,
                    InProcesssum3,
                    InProcesssum4,
                    InProcesssum5,
                    InProcesssum6,
                ],
                Disbursed: [
                    Disbursedsum1,
                    Disbursedsum2,
                    Disbursedsum3,
                    Disbursedsum4,
                    Disbursedsum5,
                    Disbursedsum6,
                ],
                Repaid: [
                    Repaidsum1,
                    Repaidsum2,
                    Repaidsum3,
                    Repaidsum4,
                    Repaidsum5,
                    Repaidsum6,
                ],
                Rejected: [
                    Rejectedsum1,
                    Rejectedsum2,
                    Rejectedsum3,
                    Rejectedsum4,
                    Rejectedsum5,
                    Rejectedsum6,
                ],
            };

            //getAdminGraphAmount


            var sum1 = 0;
            var sum2 = 0;
            var sum3 = 0;
            var sum4 = 0;
            var sum5 = 0;
            var sum6 = 0;

            var InProcesssum1 = 0;
            var InProcesssum2 = 0;
            var InProcesssum3 = 0;
            var InProcesssum4 = 0;
            var InProcesssum5 = 0;
            var InProcesssum6 = 0;

            var Disbursedsum1 = 0;
            var Disbursedsum2 = 0;
            var Disbursedsum3 = 0;
            var Disbursedsum4 = 0;
            var Disbursedsum5 = 0;
            var Disbursedsum6 = 0;

            var Repaidsum1 = 0;
            var Repaidsum2 = 0;
            var Repaidsum3 = 0;
            var Repaidsum4 = 0;
            var Repaidsum5 = 0;
            var Repaidsum6 = 0;

            var Rejectedsum1 = 0;
            var Rejectedsum2 = 0;
            var Rejectedsum3 = 0;
            var Rejectedsum4 = 0;
            var Rejectedsum5 = 0;
            var Rejectedsum6 = 0;

            var forcalc = new Date();
            var thismonth = forcalc.getMonth() + 1;
            var t = forcalc.getFullYear();
            var this1 = new Date(t, thismonth - 1, 1);

            var month1 = forcalc.getMonth();
            if (month1 <= 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);

            var month2 = forcalc.getMonth() - 1;
            if (month2 <= 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 <= 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 <= 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 <= 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);
            var todaydate = new Date();

            var countone = await this.ClaimInvoiceModel.aggregate([
                {
                    $facet: {
                        sumone: [
                            { $match: { createdAt: { $gte: this1, $lte: todaydate } } },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        sumtwo: [
                            { $match: { createdAt: { $gte: d1m1, $lte: laster1 } } },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        sumthree: [
                            { $match: { createdAt: { $gte: d1m2, $lte: laster2 } } },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        sumfour: [
                            { $match: { createdAt: { $gte: d1m3, $lte: laster3 } } },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        sumfive: [
                            { $match: { createdAt: { $gte: d1m4, $lte: laster4 } } },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        sumsix: [
                            { $match: { createdAt: { $gte: d1m5, $lte: laster5 } } },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],

                        InProsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        InProsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        InProsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        InProsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        InProsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        InProsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        {
                                            $or: [
                                                { Status: "Pending" },
                                                { Status: "Validated" },
                                                { Status: "DApproved" },
                                                { Status: "LApproved" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],

                        Disbursedsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Disbursedsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Disbursedsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Disbursedsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Disbursedsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Disbursedsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],

                        Repaidsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Repaidsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Repaidsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Repaidsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Repaidsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Repaidsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        { Status: "Repaid" },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],

                        Rejectedsumone: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: this1, $lte: todaydate } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Rejectedsumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Rejectedsumthree: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Rejectedsumfour: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Rejectedsumfive: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                        Rejectedsumsix: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        {
                                            $or: [
                                                { Status: "VRejected" },
                                                { Status: "DRejected" },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    ],
                                },
                            },
                            { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                        ],
                    },
                },
            ]);

            if (countone[0].sumone[0] != undefined) {
                sum1 += countone[0].sumone[0].total;
            } else {
                sum1 += 0;
            }
            if (countone[0].sumtwo[0] != undefined) {
                sum2 += countone[0].sumtwo[0].total;
            } else {
                sum2 += 0;
            }
            if (countone[0].sumthree[0] != undefined) {
                sum3 += countone[0].sumthree[0].total;
            } else {
                sum3 += 0;
            }
            if (countone[0].sumfour[0] != undefined) {
                sum4 += countone[0].sumfour[0].total;
            } else {
                sum4 += 0;
            }
            if (countone[0].sumfive[0] != undefined) {
                sum5 += countone[0].sumfive[0].total;
            } else {
                sum5 += 0;
            }
            if (countone[0].sumsix[0] != undefined) {
                sum6 += countone[0].sumsix[0].total;
            } else {
                sum6 += 0;
            }

            if (countone[0].InProsumone[0] != undefined) {
                InProcesssum1 += countone[0].InProsumone[0].total;
            } else {
                InProcesssum1 += 0;
            }
            if (countone[0].InProsumtwo[0] != undefined) {
                InProcesssum2 += countone[0].InProsumtwo[0].total;
            } else {
                InProcesssum2 += 0;
            }
            if (countone[0].InProsumthree[0] != undefined) {
                InProcesssum3 += countone[0].InProsumthree[0].total;
            } else {
                InProcesssum3 += 0;
            }
            if (countone[0].InProsumfour[0] != undefined) {
                InProcesssum4 += countone[0].InProsumfour[0].total;
            } else {
                InProcesssum4 += 0;
            }
            if (countone[0].InProsumfive[0] != undefined) {
                InProcesssum5 += countone[0].InProsumfive[0].total;
            } else {
                InProcesssum5 += 0;
            }
            if (countone[0].InProsumsix[0] != undefined) {
                InProcesssum6 += countone[0].InProsumsix[0].total;
            } else {
                InProcesssum6 += 0;
            }

            if (countone[0].Disbursedsumone[0] != undefined) {
                Disbursedsum1 += countone[0].Disbursedsumone[0].total;
            } else {
                Disbursedsum1 += 0;
            }
            if (countone[0].Disbursedsumtwo[0] != undefined) {
                Disbursedsum2 += countone[0].Disbursedsumtwo[0].total;
            } else {
                Disbursedsum2 += 0;
            }
            if (countone[0].Disbursedsumthree[0] != undefined) {
                Disbursedsum3 += countone[0].Disbursedsumthree[0].total;
            } else {
                Disbursedsum3 += 0;
            }
            if (countone[0].Disbursedsumfour[0] != undefined) {
                Disbursedsum4 += countone[0].Disbursedsumfour[0].total;
            } else {
                Disbursedsum4 += 0;
            }
            if (countone[0].Disbursedsumfive[0] != undefined) {
                Disbursedsum5 += countone[0].Disbursedsumfive[0].total;
            } else {
                Disbursedsum5 += 0;
            }
            if (countone[0].Disbursedsumsix[0] != undefined) {
                Disbursedsum6 += countone[0].Disbursedsumsix[0].total;
            } else {
                Disbursedsum6 += 0;
            }

            if (countone[0].Repaidsumone[0] != undefined) {
                Repaidsum1 += countone[0].Repaidsumone[0].total;
            } else {
                Repaidsum1 += 0;
            }
            if (countone[0].Repaidsumtwo[0] != undefined) {
                Repaidsum2 += countone[0].Repaidsumtwo[0].total;
            } else {
                Repaidsum2 += 0;
            }
            if (countone[0].Repaidsumthree[0] != undefined) {
                Repaidsum3 += countone[0].Repaidsumthree[0].total;
            } else {
                Repaidsum3 += 0;
            }
            if (countone[0].Repaidsumfour[0] != undefined) {
                Repaidsum4 += countone[0].Repaidsumfour[0].total;
            } else {
                Repaidsum4 += 0;
            }
            if (countone[0].Repaidsumfive[0] != undefined) {
                Repaidsum5 += countone[0].Repaidsumfive[0].total;
            } else {
                Repaidsum5 += 0;
            }
            if (countone[0].Repaidsumsix[0] != undefined) {
                Repaidsum6 += countone[0].Repaidsumsix[0].total;
            } else {
                Repaidsum6 += 0;
            }

            if (countone[0].Rejectedsumone[0] != undefined) {
                Rejectedsum1 += countone[0].Rejectedsumone[0].total;
            } else {
                Rejectedsum1 += 0;
            }
            if (countone[0].Rejectedsumtwo[0] != undefined) {
                Rejectedsum2 += countone[0].Rejectedsumtwo[0].total;
            } else {
                Rejectedsum2 += 0;
            }
            if (countone[0].Rejectedsumthree[0] != undefined) {
                Rejectedsum3 += countone[0].Rejectedsumthree[0].total;
            } else {
                Rejectedsum3 += 0;
            }
            if (countone[0].Rejectedsumfour[0] != undefined) {
                Rejectedsum4 += countone[0].Rejectedsumfour[0].total;
            } else {
                Rejectedsum4 += 0;
            }
            if (countone[0].Rejectedsumfive[0] != undefined) {
                Rejectedsum5 += countone[0].Rejectedsumfive[0].total;
            } else {
                Rejectedsum5 += 0;
            }
            if (countone[0].Rejectedsumsix[0] != undefined) {
                Rejectedsum6 += countone[0].Rejectedsumsix[0].total;
            } else {
                Rejectedsum6 += 0;
            }

            var getAdminGraphAmount = {

              monthsAndYears: [
                [thismonth, t],
                [month1, a],
                [month2, b],
                [month3, c],
                [month4, d],
                [month5, e],
              ],

              All: [sum1, sum2, sum3, sum4, sum5, sum6],
              InProcess: [
                InProcesssum1,
                InProcesssum2,
                InProcesssum3,
                InProcesssum4,
                InProcesssum5,
                InProcesssum6,
              ],
              Disbursed: [
                Disbursedsum1,
                Disbursedsum2,
                Disbursedsum3,
                Disbursedsum4,
                Disbursedsum5,
                Disbursedsum6,
              ],
              Repaid: [
                Repaidsum1,
                Repaidsum2,
                Repaidsum3,
                Repaidsum4,
                Repaidsum5,
                Repaidsum6,
              ],
              Rejected: [
                Rejectedsum1,
                Rejectedsum2,
                Rejectedsum3,
                Rejectedsum4,
                Rejectedsum5,
                Rejectedsum6,
              ],
            };

            //getSecondPieGraphForAdmin


            var forcalc = new Date();
            var thismonth = forcalc.getMonth() + 1;
            var t = forcalc.getFullYear();
            var this1 = new Date(t, thismonth - 1, 1);

            var month1 = forcalc.getMonth();
            if (month1 <= 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);

            var month2 = forcalc.getMonth() - 1;
            if (month2 <= 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 <= 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 <= 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 <= 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);

            var todaydate = new Date();

            var countTotal = 0;
            var countFunded = 0;

            var countone = await this.ClaimInvoiceModel.aggregate([
                {
                    $facet: {
                        sumone: [
                            { $match: { createdAt: { $gte: d1m5, $lte: todaydate } } },
                            { $count: "total" },
                        ],
                        sumtwo: [
                            {
                                $match: {
                                    $and: [
                                        { createdAt: { $gte: d1m5, $lte: todaydate } },
                                        { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                    ],
                                },
                            },
                            { $count: "total" },
                        ],
                    },
                },
            ]);

            if (countone[0].sumone[0] != undefined) {
                countTotal = countone[0].sumone[0].total;
            } else {
                countTotal = 0;
            }
            if (countone[0].sumtwo[0] != undefined) {
                countFunded = countone[0].sumtwo[0].total;
            } else {
                countFunded = 0;
            }

            var getSecondPieGraphForAdmin = {
                TotalInvoices: countTotal,
                TotalFunded: countFunded,
            };

            var dashboardData = await this.ClaimDashboardModel.create({

                TotalNumberOfAggregator,
                TotalNumberOfLender,
                TotalNumberOfHospital,
                UtilizedAmount: UtilizedAmount,
                repaidInvoiceCount: repaidLenth,
                Repayment: Repayment,
                TotalAvailableLimit: AvailableLimit,
                TotalCreditLimit: ExistingCreditLimit,
                Totalinvoices: Totalinvoices,
                TotalInvoicesClaimAmount: TotalInvoicesClaimAmount,
                Totalpendinginvoices: Totalpendinginvoices,
                TotalPendingClaimAmount: TotalPendingClaimAmount,
                TotalfundedInvoices: fundedInvoiceLength,
                TotalFundedClaimamount: TotalFundedClaimamount,
                TotalRejectedinvoices: TotalRejectedinvoices,
                TotalRejectedClaimAmount: TotalRejectedClaimAmount,

                //graphs

                getInvoiceGraphToAdmin: getInvoiceGraphToAdmin,
                getAdminGraphOne: getAdminGraphOne,
                getAdminGraphAmount: getAdminGraphAmount,
                getSecondPieGraphForAdmin: getSecondPieGraphForAdmin,
                jobLastUpdatedOn: new Date().toUTCString()
            });
            return { dashboardData };
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}