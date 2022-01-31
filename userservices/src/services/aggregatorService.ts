import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import { IUser, IUserInputDTO, IFilterDTO } from '../interfaces/IUser';
import argon2 from 'argon2';
import MailerService from './mailer';
import { randomBytes } from 'crypto';
import events from '../subscribers/events';
import { Types } from 'mongoose';
import moment from 'moment';
@Service()
export default class aggregatorService {
    constructor(
        @Inject('userModel') private userModel: Models.UserModel,
        @Inject('ClaimInvoice') private Invoice: Models.ClaimInvoiceModel,
        @Inject('organizationModel') private organizationModel: Models.organizationModel,
        @Inject('businessLogics') private businessLogicsModel: Models.businessLogicsModel,
        @Inject('InsuranceMasterModel') private InsuranceModel: Models.InsuranceMasterModel,
        @Inject('TPAMasterModel') private TPAModel: Models.TPAMasterModel,
        @Inject('LTVMasterModel') private ltvModel: Models.LTVMasterModel,
        @Inject('Cities') private CitiesModel: Models.CitiesModel,
        @Inject('logger') private logger,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        private mailer: MailerService,
    ) { }

    public async getDashboardForAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;

            const hospitaldata = await this.userModel.find({
                aggregatorId: userDetails._id,
            });
            if (hospitaldata) {
                var len = hospitaldata.length;
            }
            var ExistingCreditLimit = 0;
            var AvailableLimit = 0;
            var UtilizedAmount = 0;
            var Repayment = 0;
            var Totalinvoices = 0;
            var TotalInvoicesClaimAmount = 0;
            var Totalpendinginvoices = 0;
            var TotalPendingClaimAmount = 0;
            var TotalRejectedinvoices = 0;
            var TotalRejectedClaimAmount = 0;
            var fundedInvoiceLength = 0;
            var TotalFundedClaimamount = 0;
            var repaidLenth = 0;

            for (let i = 0; i < len; i++) {
                if (hospitaldata) {
                    var Existing = hospitaldata[i].ExistingCreditLimit;
                    if (Existing) {
                        ExistingCreditLimit = ExistingCreditLimit + Existing;
                    }
                }
                if (hospitaldata) {
                    var Available = hospitaldata[i].AvailableLimit;
                    if (Available) {
                        AvailableLimit = AvailableLimit + Available;
                    }
                }
                if (hospitaldata) {
                    var Utilized = hospitaldata[i].UtilizedAmount;
                    if (Utilized) {
                        UtilizedAmount = UtilizedAmount + Utilized;
                    }
                }
                if (hospitaldata) {
                    var Repay = hospitaldata[i].Repayment;
                    if (Repay) {
                        Repayment = Repayment + Repay;
                    }
                }
                var countone = await this.Invoice.aggregate([
                    {
                        $facet: {
                            sumone: [
                                { $match: { hospitalId: hospitaldata[i]._id } },
                                { $count: "total" },
                            ],
                            sum1: [
                                { $match: { hospitalId: hospitaldata[i]._id } },
                                { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                            ],
                            sumtwo: [
                                {
                                    $match: {
                                        $and: [
                                            { aggregatorId: userDetails._id },
                                            { hospitalId: hospitaldata[i]._id },
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
                            sum2: [
                                {
                                    $match: {
                                        $and: [
                                            { aggregatorId: userDetails._id },
                                            { hospitalId: hospitaldata[i]._id },
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
                                { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                            ],
                            sumthree: [
                                {
                                    $match: {
                                        $and: [
                                            { aggregatorId: userDetails._id },
                                            { hospitalId: hospitaldata[i]._id },
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
                            sum3: [
                                {
                                    $match: {
                                        $and: [
                                            { aggregatorId: userDetails._id },
                                            { hospitalId: hospitaldata[i]._id },
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
                                { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                            ],
                            sumfour: [
                                {
                                    $match: {
                                        $and: [
                                            { aggregatorId: userDetails._id },
                                            { hospitalId: hospitaldata[i]._id },
                                            { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],
                            sum4: [
                                {
                                    $match: {
                                        $and: [
                                            { aggregatorId: userDetails._id },
                                            { hospitalId: hospitaldata[i]._id },
                                            { $or: [{ Status: "Funded" }, { Status: "Repaid" }] },
                                        ],
                                    },
                                },
                                { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                            ],
                            sumfive: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
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
                    Totalinvoices += countone[0].sumone[0].total;
                } else {
                    Totalinvoices += 0;
                }
                if (countone[0].sum1[0] != undefined) {
                    TotalInvoicesClaimAmount += countone[0].sum1[0].total;
                } else {
                    TotalInvoicesClaimAmount += 0;
                }
                if (countone[0].sumtwo[0] != undefined) {
                    Totalpendinginvoices += countone[0].sumtwo[0].total;
                } else {
                    Totalpendinginvoices += 0;
                }
                if (countone[0].sum2[0] != undefined) {
                    TotalPendingClaimAmount += countone[0].sum2[0].total;
                } else {
                    TotalPendingClaimAmount += 0;
                }
                if (countone[0].sumthree[0] != undefined) {
                    TotalRejectedinvoices += countone[0].sumthree[0].total;
                } else {
                    TotalRejectedinvoices += 0;
                }
                if (countone[0].sum3[0] != undefined) {
                    TotalRejectedClaimAmount += countone[0].sum3[0].total;
                } else {
                    TotalRejectedClaimAmount += 0;
                }
                if (countone[0].sumfour[0] != undefined) {
                    fundedInvoiceLength += countone[0].sumfour[0].total;
                } else {
                    fundedInvoiceLength += 0;
                }
                if (countone[0].sum4[0] != undefined) {
                    TotalFundedClaimamount += countone[0].sum4[0].total;
                } else {
                    TotalFundedClaimamount += 0;
                }
                if (countone[0].sumfive[0] != undefined) {
                    repaidLenth += countone[0].sumfive[0].total;
                } else {
                    repaidLenth += 0;
                }
            }
            var data = {
                success: true,
                Totalhospital: len,
                UtilizedAmount: UtilizedAmount,
                repaidInvoiceCount: repaidLenth,
                Repayment: Repayment,
                TotalAvailableLimit: AvailableLimit,
                CreditLimit: ExistingCreditLimit,
                Totalinvoices: Totalinvoices,
                TotalInvoicesClaimAmount: TotalInvoicesClaimAmount,
                Totalpendinginvoices: Totalpendinginvoices,
                TotalPendingClaimAmount: TotalPendingClaimAmount,
                TotalfundedInvoices: fundedInvoiceLength,
                TotalFundedClaimamount: TotalFundedClaimamount,
                TotalRejectedinvoices: TotalRejectedinvoices,
                TotalRejectedClaimAmount: TotalRejectedClaimAmount,
            }
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getInvoiceGraphToAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;

            var countInvoice = 0;
            var countInProcess = 0;
            var countDisbursed = 0;
            var countRejected = 0;
            var countRepaid = 0;

            var forcalc = new Date();
            var thismonth = forcalc.getMonth() + 1;
            var t = forcalc.getFullYear();
            var this1 = new Date(t, thismonth - 1, 1);

            var month1 = forcalc.getMonth();
            if (month1 < 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);

            var month2 = forcalc.getMonth() - 1;
            if (month2 < 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 < 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);

            var todaydate = new Date();

            var hospitaldata = await this.userModel.find({ aggregatorId: userDetails._id });
            if (hospitaldata) {
                var len = hospitaldata.length;

                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: todaydate } },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumtwo: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                        countInvoice += countone[0].sumone[0].total;
                    } else {
                        countInvoice += 0;
                    }
                    if (countone[0].sumtwo[0] != undefined) {
                        countInProcess += countone[0].sumtwo[0].total;
                    } else {
                        countInProcess += 0;
                    }
                    if (countone[0].sumthree[0] != undefined) {
                        countDisbursed += countone[0].sumthree[0].total;
                    } else {
                        countDisbursed += 0;
                    }
                    if (countone[0].sumfour[0] != undefined) {
                        countRejected += countone[0].sumfour[0].total;
                    } else {
                        countRejected += 0;
                    }
                    if (countone[0].sumfive[0] != undefined) {
                        countRepaid += countone[0].sumfive[0].total;
                    } else {
                        countRepaid += 0;
                    }
                }
            }

            var data = {
                success: true,
                Totalinvoicescount: countInvoice,
                TotalcountInProcess: countInProcess,
                TotalcountDisbursed: countDisbursed,
                TotalcountRejected: countRejected,
                TotalcountRepaid: countRepaid,
            }
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAggregatorGraphAmount(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {

            const userDetails = currentUser;

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
            if (month1 < 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);
            if (month1 <= 0) {
                month1 += 12;
                a = a - 1
            }
            var month2 = forcalc.getMonth() - 1;
            if (month2 < 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 < 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);

            var todaydate = new Date();

            var hospitaldata = await this.userModel.find({ aggregatorId: userDetails._id });
            if (hospitaldata) {
                var len = hospitaldata.length;

                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: this1, $lte: todaydate } },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumtwo: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m1, $lte: laster1 } },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumthree: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m2, $lte: laster2 } },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumfour: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m3, $lte: laster3 } },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumfive: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m4, $lte: laster4 } },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumsix: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: laster5 } },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],

                                InProsumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { createdAt: { $gte: this1, $lte: todaydate } },
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                                                { hospitalId: hospitaldata[i]._id },
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
                }
            }

            var data = {
                success: true,
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

            }
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAggregatorGraphOne(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;

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
            if (month1 < 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);
            if (month1 <= 0) {
                month1 += 12;
                a = a - 1
            }
            var month2 = forcalc.getMonth() - 1;
            if (month2 < 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 < 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0);

            var todaydate = new Date();

            var hospitaldata = await this.userModel.find({ aggregatorId: userDetails._id });
            if (hospitaldata) {
                var hos = hospitaldata.length;
            }
            for (let i = 0; i < hos; i++) {
                var countone = await this.Invoice.aggregate([
                    {
                        $facet: {
                            sumone: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
                                            { createdAt: { $gte: this1, $lte: todaydate } },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],
                            sumtwo: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
                                            { createdAt: { $gte: d1m1, $lte: laster1 } },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],
                            sumthree: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
                                            { createdAt: { $gte: d1m2, $lte: laster2 } },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],
                            sumfour: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
                                            { createdAt: { $gte: d1m3, $lte: laster3 } },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],
                            sumfive: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
                                            { createdAt: { $gte: d1m4, $lte: laster4 } },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],
                            sumsix: [
                                {
                                    $match: {
                                        $and: [
                                            { hospitalId: hospitaldata[i]._id },
                                            { createdAt: { $gte: d1m5, $lte: laster5 } },
                                        ],
                                    },
                                },
                                { $count: "total" },
                            ],

                            InProsumone: [
                                {
                                    $match: {
                                        $and: [
                                            { createdAt: { $gte: this1, $lte: todaydate } },
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
                                            { hospitalId: hospitaldata[i]._id },
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
            }
            var data = {
                success: true,
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
            }
            return { data };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getSecondPieGraphForAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;

            var forcalc = new Date();
            var thismonth = forcalc.getMonth() + 1;
            var t = forcalc.getFullYear();
            var this1 = new Date(t, thismonth - 1, 1);

            var month1 = forcalc.getMonth();
            if (month1 < 0) {
                month1 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month1);
            var a = forcalc.getFullYear();
            var d1m1 = new Date(a, month1 - 1, 1);
            var laster1 = new Date(a, month1, 0);
            laster1.setHours(23, 59, 59, 0);

            var month2 = forcalc.getMonth() - 1;
            if (month2 < 0) {
                month2 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month2);
            var b = forcalc.getFullYear();
            var d1m2 = new Date(b, month2 - 1, 1);
            var laster2 = new Date(b, month2, 0);
            laster2.setHours(23, 59, 59, 0);

            var month3 = forcalc.getMonth() - 1;
            if (month3 < 0) {
                month3 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month3);
            var c = forcalc.getFullYear();
            var d1m3 = new Date(c, month3 - 1, 1);
            var laster3 = new Date(c, month3, 0);
            laster3.setHours(23, 59, 59, 0);

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0);

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
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
            var hospitaldata = await this.userModel.find({ aggregatorId: userDetails._id });
            if (hospitaldata) {
                var len = hospitaldata.length;

                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: todaydate } },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumtwo: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: hospitaldata[i]._id },
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
                        countTotal += countone[0].sumone[0].total;
                    } else {
                        countTotal += 0;
                    }
                    if (countone[0].sumtwo[0] != undefined) {
                        countFunded += countone[0].sumtwo[0].total;
                    } else {
                        countFunded += 0;
                    }
                }
            }
            var data = {
                success: true,
                TotalInvoices: countTotal,
                TotalFunded: countFunded,
            }
            return { data }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAllHospitalToAggregator(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
        try {
            //pagination
            var pageNumber = 1;
            var pageSize = 0;
            if (IFilterDTO.pageNumber) {
                var pageNumber = IFilterDTO.pageNumber;
            }
            if (IFilterDTO.pageSize) {
                var pageSize = IFilterDTO.pageSize;
            }
            //search
            // var filters = IFilterDTO.filters || [];
            var searchFilters = [];
            searchFilters.push({ aggregatorId: currentUser._id, isDeleted: false });

            // for (var element of filters) {
            //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
            // }
            var userCount = await this.userModel.find({ $and: searchFilters }).countDocuments();
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var invoices = await this.userModel
                .find({ $and: searchFilters })
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            var data = { success: true, count: userCount, message: invoices, numberOfPages };
            return { data }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async splitForAgri(req: Request, currentUser: IUser): Promise<{ data: any }> {
        try {
            // const userDetails = req.currentUser;
            var { HospitalROI, AggregetorLoan, HospitalLoan, AggregeorId } = req.body;

            var agriRoi = 0;
            // if (!userDetails) {
            //   return res.status(400).json({
            //     message: "Not a valid user",
            //   });
            // }
            const agriData = await this.userModel.findOne({ _id: AggregeorId });

            if (
                agriData.ROIForAggregator != null &&
                agriData.ROIForAggregator != undefined &&
                agriData.ROIForAggregator > 0
            ) {
            } else {
                return {
                    data: {
                        message:
                            "rate of intrest for this aggrigator is not found please contact admin",
                    }
                };
            }

            if (HospitalROI > 0 && AggregetorLoan > 0 && HospitalLoan > 0) {
                var hospitalv1 = (HospitalLoan * HospitalROI) / 100;

                var agriv1 = agriData.ROIForAggregator - hospitalv1;

                agriRoi = (agriv1 * 100) / AggregetorLoan;
            }

            return { data: { success: true, agriRoi } };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async addHospitalByAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { name } = req.body;

            let {
                email,
                CINNumber,
                contactPerson,
                GSTNumber,
                mobileNumber,
                GSTcertificate,
                AddressProofoftheHospital,
                PANNumber,
                address,
                role,
                password,
                DateOfRegistration,
                HospitalRegistrationCertificate,
                AggregetorLoan,
                HospitalLoan,
                AggregetorROI,
                HospitalROI,
                isSplit,
            } = req.body;
            if (isSplit) {
                if (!(AggregetorLoan &&
                    HospitalLoan &&
                    AggregetorROI &&
                    HospitalROI)) {
                        return{
                            data:{
                                success: false,
                                message: "incomplete split data"
                            }
                        }
                }
            }
            const userDetails = currentUser;

            const findUser = await this.userModel.findOne({ email: email });

            if (findUser && findUser._id && findUser.name) {
                return {
                    data: {
                        success: false,
                        message: "Email is already registered.",
                    }
                };
            }

            const currentOrgRecord = await this.organizationModel.findOne({ _id: currentUser.organizationId })

            const orgRecord = await this.organizationModel.create({
                nameOfOrganization: name,
                typeOfOrganization: role,
                dateOfRegistration: DateOfRegistration,
                contactNumber: mobileNumber,
                email: email,
                orgSidebar: currentOrgRecord.orgSidebar,
                testOrg: currentOrgRecord.testOrg,
                isActive: true,
                isDeleted: false,
                updatedAt: new Date().toUTCString(),
                createdAt: new Date().toUTCString(),
            })


            // Convert pass to hash & salt
            const salt = randomBytes(32);
            this.logger.silly('Hashing password');
            const hashedPassword = await argon2.hash(password, { salt });

            const userRecord = await this.userModel.create({
                organizationId: orgRecord._id,
                name: name,
                email: email,
                CINNumber: CINNumber,
                contactPerson: contactPerson,
                GSTNumber: GSTNumber,
                mobileNumber: mobileNumber,
                GSTcertificate: GSTcertificate,
                AddressProofoftheHospital: AddressProofoftheHospital,
                PANNumber: PANNumber,
                address: address,
                role: role,
                DateOfRegistration: DateOfRegistration,
                password: hashedPassword,
                HospitalRegistrationCertificate,
                salt: salt.toString('hex'),
                aggregatorId: userDetails._id,
                isSplit: isSplit,
                isActive: false,
                isDeleted: false,
                createdAt: new Date().toUTCString(),
                passwordUpdatedOn: new Date().toUTCString(),
                updatedBy: userDetails._id,
            });
            if (!userRecord || !userRecord.email || userRecord.email !== email) {
                return {
                    data: {
                        success: false,
                        message: "Unable to register user.",
                    }
                };
            }

            if (
                AggregetorLoan &&
                HospitalLoan &&
                AggregetorROI &&
                HospitalROI &&
                userRecord &&
                isSplit
            ) {
                const businessLogicsOBJ = {
                    AggregetorLoan: AggregetorLoan,
                    HospitalLoan: HospitalLoan,
                    AggregetorROI: AggregetorROI,
                    HospitalROI: HospitalROI,
                    hospitalId: userRecord._id,
                    createdAt: Date.now(),
                    updatedBy: userDetails._id,
                };
                const newBusinessLogic = new this.businessLogicsModel(businessLogicsOBJ);
                let saveBusinessLogic = await newBusinessLogic.save();
            } else {
                this.logger.info(
                    "AggregetorLoan:", AggregetorLoan,
                    "HospitalLoan: ", HospitalLoan,
                    "AggregetorROI: ", AggregetorROI,
                    "HospitalROI: ", HospitalROI,
                    "userRecord: ", userRecord,
                    "isSplit: ", isSplit)
            }

            delete userRecord.password;
            delete userRecord.salt;
            delete userRecord._id;

            return {
                data: {
                    success: true,
                    message: "success",
                    user: userRecord,
                    newUser: true,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getHospitalByIdToAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const ID = req.query._id;
            const userDetails = currentUser;

            var businessLogicsdata = {};

            const invoices = await this.userModel.findOne({ _id: ID });
            const invoice = await this.userModel.findOne({ hospitalId: ID });

            if (invoices.isSplit == true) {
                const businessLogics = await this.businessLogicsModel.findOne({
                    hospitalId: invoices._id,
                });
                if (businessLogics) {
                    businessLogicsdata = businessLogics;
                }
            }

            return {
                data: {
                    success: true,
                    message: invoices,
                    ValidatorData: invoice,
                    splitdata: businessLogicsdata,
                }
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async editHospitalProfileByAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _id } = req.query;
            const userDetails = currentUser;
            const {
                name,
                GSTNumber,
                DateOfRegistration,
                PANNumber,
                NoOfClaimProcessedInAYear,
                TotalNoOfClaimProcessed,
                AverageTicketSizeOfTheClaims,
                NoOfTPAsAssociated,
                NoOfDirectInsuranceCompaniesAssociated,
                DoYouHaveAnExistingWorkingCapitalLoan,
                ExistingCreditLimit,
                CINNumber,
                mobileNumber,
                address,
                AccountName,
                AccountNumber,
                NameOfTheBank,
                IFSCcode,
                Branch,
                contactPerson,
                NameOfDirector,
                DirectorPANNumber,
                ContactNumberOfDirector,
                DirectorEmail,
                GSTUrl,
                AddressDocUrl,
                RegCertificateUrl,
                FinancialStUrl,
                NOCextUrl,
                TwoYearBankStUrl,
                TwoyearTTRUrl,
                otherUrl,
                AadharDocUrl,
                AadharNumber,
                conDetailDirUrl,
                KYCDocUrl,
                escrowAccountName,
                escrowBranch,
                escrowIFSCcode,
                escrowNameOfTheBank,
                escrowAccountNumber,
                ParriPassuUrl,
            } = req.body;

            const hosAggUpdate = await this.userModel.findById({ _id: _id });

            if (!hosAggUpdate) {
                return {
                    data: {
                        success: false,
                        message: "Invalid User Id!",
                    }
                };
            }

            let data: any = {};
            if (name) {
                data.name = name;
            }
            if (GSTNumber) {
                data.GSTNumber = GSTNumber;
            }
            if (DateOfRegistration) {
                data.DateOfRegistration = DateOfRegistration;
            }
            if (NoOfClaimProcessedInAYear) {
                data.NoOfClaimProcessedInAYear = NoOfClaimProcessedInAYear;
            }
            if (TotalNoOfClaimProcessed) {
                data.TotalNoOfClaimProcessed = TotalNoOfClaimProcessed;
            }
            if (PANNumber) {
                data.PANNumber = PANNumber;
            }
            if (AverageTicketSizeOfTheClaims) {
                data.AverageTicketSizeOfTheClaims = AverageTicketSizeOfTheClaims;
            }
            if (NoOfDirectInsuranceCompaniesAssociated) {
                data.NoOfDirectInsuranceCompaniesAssociated =
                    NoOfDirectInsuranceCompaniesAssociated;
            }
            if (DoYouHaveAnExistingWorkingCapitalLoan) {
                data.DoYouHaveAnExistingWorkingCapitalLoan =
                    DoYouHaveAnExistingWorkingCapitalLoan;
            }
            if (ExistingCreditLimit) {
                data.ExistingCreditLimit = ExistingCreditLimit;
            }
            if (CINNumber) {
                data.CINNumber = CINNumber;
            }
            if (mobileNumber) {
                data.mobileNumber = mobileNumber;
            }
            if (address) {
                data.address = address;
            }
            if (AccountName) {
                data.AccountName = AccountName;
            }
            if (AccountNumber) {
                data.AccountNumber = AccountNumber;
            }
            if (NameOfTheBank) {
                data.NameOfTheBank = NameOfTheBank;
            }
            if (IFSCcode) {
                data.IFSCcode = IFSCcode;
            }
            if (Branch) {
                data.Branch = Branch;
            }
            if (NameOfDirector) {
                data.NameOfDirector = NameOfDirector;
            }
            if (DirectorPANNumber) {
                data.DirectorPANNumber = DirectorPANNumber;
            }
            if (AadharNumber) {
                data.AadharNumber = AadharNumber;
            }
            if (ContactNumberOfDirector) {
                data.ContactNumberOfDirector = ContactNumberOfDirector;
            }
            if (DirectorEmail) {
                data.DirectorEmail = DirectorEmail;
            }
            if (GSTUrl) {
                data.GSTUrl = GSTUrl;
            }
            if (AddressDocUrl) {
                data.AddressDocUrl = AddressDocUrl;
            }
            if (RegCertificateUrl) {
                data.RegCertificateUrl = RegCertificateUrl;
            }
            if (FinancialStUrl) {
                data.FinancialStUrl = FinancialStUrl;
            }
            if (NOCextUrl) {
                data.NOCextUrl = NOCextUrl;
            }
            if (TwoYearBankStUrl) {
                data.TwoYearBankStUrl = TwoYearBankStUrl;
            }
            if (TwoyearTTRUrl) {
                data.TwoyearTTRUrl = TwoyearTTRUrl;
            }
            if (otherUrl) {
                data.otherUrl = otherUrl;
            }
            if (AadharDocUrl) {
                data.AadharDocUrl = AadharDocUrl;
            }
            if (conDetailDirUrl) {
                data.conDetailDirUrl = conDetailDirUrl;
            }
            if (KYCDocUrl) {
                data.KYCDocUrl = KYCDocUrl;
            }
            if (ParriPassuUrl) {
                data.ParriPassuUrl = ParriPassuUrl;
            }
            if (contactPerson) {
                data.contactPerson = contactPerson;
            }
            if (NoOfTPAsAssociated) {
                data.NoOfTPAsAssociated = NoOfTPAsAssociated;
            }

            if (escrowAccountName) {
                data.escrowAccountName = escrowAccountName;
            }
            if (escrowBranch) {
                data.escrowBranch = escrowBranch;
            }
            if (escrowIFSCcode) {
                data.escrowIFSCcode = escrowIFSCcode;
            }
            if (escrowNameOfTheBank) {
                data.escrowNameOfTheBank = escrowNameOfTheBank;
            }
            if (escrowAccountNumber) {
                data.escrowAccountNumber = escrowAccountNumber;
            }

            const aggHosList = await this.userModel.updateOne({ _id: _id }, { $set: data });

            return {
                data: {
                    success: true,
                    message: "Hospital Updated Successfully By Aggregator",
                    hosAggUpdate,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getByIdToAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _id } = req.query;
            const userDetails = currentUser;

            const Eq = userDetails._id;
            if (Eq == _id) {
                const getAggregator = await this.userModel.findOne({ _id });
                return {
                    data: {
                        success: true,
                        message: getAggregator,
                    }
                };
            }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async editAggregatorProfile(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            const { _id } = req.query;
            const {
                name,
                mobileNumber,
                address,
                TotalNoOfHospital,
                NoOfTPAsAssociated,
                NoOfClaimProcessedInAYear,
                totalValueofClaimsProcessed,
                AverageTicketSizeOfTheClaims,
                NoOfDirectInsuranceCompaniesAssociated,
                AccountName,
                AccountNumber,
                NameOfTheBank,
                IFSCcode,
                Branch,
                PANNumber,
                PANcardUrl,
                AttachedDocUrl,
                CINNumber,
            } = req.body;

            const Dt = userDetails._id;
            if (Dt == _id) {
                const editAgg = await this.userModel.findOne({ _id });
                if (!editAgg) {
                    return {
                        data: {
                            success: false,
                            message: "Invalid Id!",
                            editAgg,
                        }
                    };
                }

                let data: any = {};
                if (name) {
                    data.name = name;
                }
                if (mobileNumber) {
                    data.mobileNumber = mobileNumber;
                }
                if (address) {
                    data.address = address;
                }
                if (TotalNoOfHospital) {
                    data.TotalNoOfHospital = TotalNoOfHospital;
                }
                if (NoOfTPAsAssociated) {
                    data.NoOfTPAsAssociated = NoOfTPAsAssociated;
                }
                if (NoOfClaimProcessedInAYear) {
                    data.NoOfClaimProcessedInAYear = NoOfClaimProcessedInAYear;
                }
                if (totalValueofClaimsProcessed) {
                    data.totalValueofClaimsProcessed = totalValueofClaimsProcessed;
                }
                if (AverageTicketSizeOfTheClaims) {
                    data.AverageTicketSizeOfTheClaims = AverageTicketSizeOfTheClaims;
                }
                if (NoOfDirectInsuranceCompaniesAssociated) {
                    data.NoOfDirectInsuranceCompaniesAssociated =
                        NoOfDirectInsuranceCompaniesAssociated;
                }
                if (address) {
                    data.address = address;
                }
                if (AccountName) {
                    data.AccountName = AccountName;
                }
                if (AccountNumber) {
                    data.AccountNumber = AccountNumber;
                }
                if (NameOfTheBank) {
                    data.NameOfTheBank = NameOfTheBank;
                }
                if (IFSCcode) {
                    data.IFSCcode = IFSCcode;
                }
                if (Branch) {
                    data.Branch = Branch;
                }
                if (PANcardUrl) {
                    data.PANcardUrl = PANcardUrl;
                }
                if (AttachedDocUrl) {
                    data.AttachedDocUrl = AttachedDocUrl;
                }
                if (CINNumber) {
                    data.CINNumber = CINNumber;
                }
                if (PANNumber) {
                    data.PANNumber = PANNumber;
                }

                var users = await this.userModel.find({ PANNumber: PANNumber });

                for (var doc of users) {
                    if (doc._id === userDetails._id) {
                        return {
                            data: {
                                message: " PAN Number already exist",
                            }
                        };
                    }
                }

                var users = await this.userModel.find({ AccountNumber: AccountNumber });

                for (var doc of users) {
                    if (doc._id === userDetails._id) {
                        return {
                            data: {
                                message: " Account Number already exist",
                            }
                        };
                    }
                }

                const updateBL = await this.userModel.updateOne({ _id }, { $set: data });

                return {
                    data: {
                        success: true,
                        message: "Aggregator Profile Updated Successfully",
                    }
                };
            }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async deleteHospitalByAggregator(req: Request, res: Response): Promise<{ data: any }> {
        try {
            const id = req.query._id;
            await this.userModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true, isActive: false } }, { useFindAndModify: false });
            const data = ({ success: true, message: 'hospital deleted' })
            return { data };
        } catch (e) {
            this.logger.error(e);
            return {
                data: { success: false, error: e },
            }
        }
    }
    public async getInvoiceByAggregatorID(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
        try {

            var pageNumber = 1;
            var pageSize = 0;
            if (IFilterDTO.pageNumber) {
                var pageNumber = parseInt(IFilterDTO.pageNumber.toString());
            }
            if (IFilterDTO.pageSize) {
                var pageSize = parseInt(IFilterDTO.pageSize.toString());
            }

            var searchFilters = [];
            searchFilters.push({ aggregatorId: currentUser._id });
            if (IFilterDTO.Status != undefined || null) {
                searchFilters.push({ Status: IFilterDTO.Status });
            }

            var userCount = await this.Invoice.find({ $and: searchFilters }).countDocuments();
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);

            var aggregatoInvoices = await this.Invoice
                .find({ $and: searchFilters })
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);;

            return {
                data: {
                    success: true,
                    message: aggregatoInvoices,
                    numberOfPages
                }
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getInvoiceByIdToAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const Id = req.query;
            const userDetails = currentUser;

            const invoices = await this.Invoice.findOne({ _id: Id });
            return { data: { success: true, message: invoices } };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAllInvoicebyHospitalToAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;

            const invoices = await this.Invoice.find({
                $and: [{ aggregatorId: userDetails._id }, { Status: "Repaid" }],
            }).distinct("hospitalId");
            var List;
            var Lists = [];
            if (invoices) {
                for (let i = 0; i < invoices.length; i++) {
                    let id = invoices[i];
                    List = await this.userModel.findOne({ _id: id });
                    Lists = Lists.concat(List);
                }
            }
            if (Lists) {
                var data = Lists.length;
            }
            return { data: { success: true, count: data, message: Lists } };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getRepaidInvoiceToAggregator(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            const Repaidinvoices = await this.Invoice.find({
                $and: [{ aggregatorId: userDetails._id }, { Status: "Repaid" }],
            });
            if (Repaidinvoices) {
                var Repaidinvoice = Repaidinvoices.length;

                var TotalRepaidAmount = 0;
                var TotalApprovalAmount = 0;
                for (let i = 0; i < Repaidinvoice; i++) {
                    var repaidamount = Repaidinvoices[i].claimAmount;
                    if (repaidamount) {
                        TotalRepaidAmount = TotalRepaidAmount + repaidamount;
                    }
                    var amount = Repaidinvoices[i].AmountDisbursed;
                    if (amount) {
                        TotalApprovalAmount = TotalApprovalAmount + amount;
                    }
                }
            }
            return {
                data: {
                    success: true,
                    count: Repaidinvoice,
                    TotalclaimAmount: TotalRepaidAmount,
                    TotalamountDisbursed: TotalApprovalAmount,
                    message: Repaidinvoices,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getFundedInvoiceToAggregatorV1(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
        try {
            //pagination
            var pageNumber = 1;
            var pageSize = 0;
            if (IFilterDTO.pageNumber) {
                var pageNumber = IFilterDTO.pageNumber;
            }
            if (IFilterDTO.pageSize) {
                var pageSize = IFilterDTO.pageSize;
            }

            //search
            var filters = IFilterDTO.filters || [];
            var searchFilters = [];
            searchFilters.push(
                { hospitalId: IFilterDTO._id },
                { Status: "Funded" },
                { RepaidStatus: { $ne: "Repaid" } });
            // for (var element of filters) {
            //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
            // }
            var userCount = await this.Invoice.find({ $and: searchFilters }).countDocuments();
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var fundedAggregator = await this.Invoice
                .find({ $and: searchFilters })
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            return {
                data: {
                    success: true,
                    count: userCount,
                    message: fundedAggregator,
                    numberOfPages
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async bulkUpdateRepayment(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _ids, PaymentReceivedDate, ReceivedNEFT_RTG } = req.body;
            const userDetails = currentUser;
            _ids.forEach(async (_id) => {
                const vendorDetail = await this.Invoice.findOne({ _id: _id._id });
                if (!vendorDetail) {
                    return {
                        data: {
                            message: "Not a valid Vendor ID",
                        }
                    };
                }
                let anchorDetails: any = {};
                anchorDetails.LresponseDate = new Date();
                anchorDetails.Status = "Repaid";
                anchorDetails.RepaidStatus = "Repaid";

                if (_id.AmountReceived) {
                    anchorDetails.AmountReceived = _id.AmountReceived;
                }
                if (PaymentReceivedDate) {
                    var date1 = new Date(PaymentReceivedDate);
                    var finalDate1 = new Date(date1.setDate(date1.getDate() + 1));
                    anchorDetails.PaymentReceivedDate = new Date(finalDate1);
                }
                if (ReceivedNEFT_RTG) {
                    anchorDetails.ReceivedNEFT_RTG = ReceivedNEFT_RTG;
                }

                const hosDetail = await this.userModel.findOne({
                    _id: vendorDetail.hospitalId,
                });

                var LenderTenure = hosDetail.LenderTenure;
                var AmountDisbursed = vendorDetail.AmountDisbursed;
                var ApporvedAmount = vendorDetail.ApporvedAmount;
                var date2 = new Date(vendorDetail.DueDate);
                var date1 = new Date(PaymentReceivedDate);

                var AdditionalDays;
                AdditionalDays = Math.floor(
                    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
                );

                var Interest = 0;
                Interest = vendorDetail.Interest;
                // var PFFees;
                // PFFees = vendorDetail.PFFees;   //commented  we did not take processing fees
                var AmountToBePaid;
                AmountToBePaid = vendorDetail.AmountToBePaid; // AmountToBePaid is the amount with disbursed + intrest

                var AdditionalInterest = 0;
                if (AdditionalDays >= 0) {
                    AdditionalInterest = Math.round(
                        (ApporvedAmount * hosDetail.LenderROI * AdditionalDays) /
                        (30 * 100)
                    );
                    anchorDetails.AdditionalDays = AdditionalDays;
                } else {
                    anchorDetails.AdditionalDays = 0;
                }

                var RemainingAmount = 0;
                var PastRecovery = 0;

                var TotalDeduction = Math.round(ApporvedAmount + AdditionalInterest);
                var BalanceAmount = Math.round(TotalDeduction + PastRecovery);

                RemainingAmount = Math.round(_id.AmountReceived - BalanceAmount);
                anchorDetails.SettleStatus = "FullPaid";

                if (hosDetail.Repayment != undefined) {
                    var repaymentLimit = hosDetail.Repayment;
                }

                var recivedAmount = Math.round(
                    repaymentLimit + vendorDetail.ApporvedAmount
                );
                if (hosDetail.Repayment != undefined) {
                    var AvailableLimit =
                        hosDetail.ExistingCreditLimit -
                        hosDetail.UtilizedAmount +
                        recivedAmount;
                }

                anchorDetails.PastRecovery = PastRecovery;
                anchorDetails.LateRecovery = 0;
                anchorDetails.PastRecoveryDetails = "NA";
                anchorDetails.PastRecoveryNumber = "NA";
                anchorDetails.AdditionalInterest = AdditionalInterest;
                anchorDetails.RemainingAmount = RemainingAmount;
                anchorDetails.BalanceAmount = BalanceAmount;
                anchorDetails.TotalDeduction = TotalDeduction;

                const updtvendor = await this.userModel.updateOne(
                    { _id: vendorDetail.hospitalId },
                    {
                        $set: {
                            Repayment: recivedAmount,
                            AvailableLimit: AvailableLimit,
                        },
                    }
                );

                const invoices = await this.Invoice.updateOne(
                    { _id: _id },
                    { $set: anchorDetails }
                );

            });
            return { data: { success: true, message: "Succesfully Update" } };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async updatePassword(req, userInputDTO: IUserInputDTO, currentUser: IUser): Promise<{ data: any }> {
        try {
            const id = currentUser._id;
            const userDetails = await this.userModel.findOne({ _id: id });
            if (!userDetails) {
                return {
                    data: {
                        success: false,
                        message: "user not found"
                    }
                }
            }
            const salt = randomBytes(32);
            this.logger.silly('Hashing password');
            const hashedPassword = await argon2.hash(userInputDTO.password, { salt });

            this.logger.silly('updating password');
            let passwordData: any = {};

            passwordData.updatedAt = new Date().toUTCString();
            passwordData.updatedBy = currentUser._id;
            passwordData.salt = salt.toString('hex');
            passwordData.password = hashedPassword;
            passwordData.passwordUpdateOn = new Date().toUTCString();

            const userRecord = await this.userModel.findByIdAndUpdate(
                { _id: id },
                { $set: passwordData },
                { useFindAndModify: false, new: true });
            if (!userRecord) {
                throw new Error('password cannot be updated');
            }

            const user = userRecord.toObject();
            Reflect.deleteProperty(user, 'password');
            Reflect.deleteProperty(user, 'salt');
            var data = { success: true }
            return { data };
        }
        catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }

    // get TPA with Insurer
    public async getTPAwithInsurer(req: Request): Promise<{ data: any }> {
        try {
            const Id = req.query.Id;
            const TPA = await this.TPAModel.find({ InsuranceCompanyId: Id });

            var data = {
                success: true,
                message: TPA,
            }
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    // get insurance
    public async getInsurance(req: Request): Promise<{ data: any }> {
        try {
            const Insurance = await this.InsuranceModel.find();

            var data = {
                success: true,
                message: Insurance,
            }
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async invoiceUploadagv1(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            var { claimSubmissionDate, dateOfDischarge, dateOfAdmission } = req.body;

            const {
                nameOfHospital,
                TPAName,
                insurerAprovedAmount,
                InsuranceCompanyName,
                claimId,
                nameOfInsurer,
                finalBillNumber,
                nameOfTPA,
                policyNumber,
                hospitalId,
                TPAId,
                InsuranceCompanyId,
                invoiceId,
                invoiceDocumentUrl,
                insuranceApprovalLetter,
                claimAmount,
                aggregatorId,
                Description,
            } = req.body;

            const userDetails = currentUser;

            const hospitalData = await this.userModel.findOne({ _id: hospitalId });

            const businessLogicsData = await this.businessLogicsModel.findOne({
                hospitalId: hospitalId,
            });

            // if (hospitalData.isActive == false) {
            //     return {
            //         data: {
            //             success: false,
            //             message: "This hospital Apporved By DigiSparsh",
            //         }
            //     };
            // }

            // if (
            //     hospitalData.LStatus === undefined ||
            //     hospitalData.LStatus != "Approved" ||
            //     hospitalData.LStatus == "Rejected"
            // ) {
            //     return {
            //         data: {
            //             success: false,
            //             message: " you are not Apporved By Lender",
            //         }
            //     };
            // }

            if (hospitalData.isSplit == true) {
                const claimIdData = await this.Invoice.findOne({ claimId: claimId });
                if (claimIdData) {
                    return {
                        data: {
                            success: false,
                            message: "claimId Already Exists ",
                        }
                    };
                }

                if (claimAmount >= hospitalData.AvailableLimit) {
                    return {
                        data: {
                            success: false,
                            message:
                                "You have not sufficience Balance, cross avaliable limit",
                        }
                    };
                }

                // if (hospitalId) {
                // const alldata = await this.ltvModel.findOne({ hospialID: hospitalId });
                var LTVbyHos = hospitalData.LTV;
                // if (!alldata) {
                //     return {
                //         data: {
                //             message:
                //                 "Data(Ltv) is null,please select this  Data from admin",
                //         }
                //     };
                // }

                var aggriSplitAmount = 0;
                var hospitalSplitAmount = 0;

                var disallowancePercent = 0;
                disallowancePercent =
                    100 - (insurerAprovedAmount / claimAmount) * 100;
                const ltvToApprov = 90 - disallowancePercent;
                const Ltvper = Math.round(ltvToApprov);
                const Ltvpercent = Math.round(Ltvper / 5) * 5;
                if (Ltvpercent && LTVbyHos) {
                    if (Ltvpercent > LTVbyHos) {
                        var LTV = LTVbyHos;
                    } else {
                        LTV = Ltvpercent;
                    }
                }

                var LTVAmount = (insurerAprovedAmount * LTV) / 100;
                // } else {
                //     return {
                //         data: {
                //             message: "hospitalId  is not occure",
                //         }
                //     };
                // }

                const LenderLTV = hospitalData.LTV;
                if (hospitalData.LenderTenure != undefined || null || 0) {
                    var LenderTenure = hospitalData.LenderTenure
                } else {
                    var LenderTenure = 30;
                }
                if (hospitalData.LenderROI != undefined || null || 0) {
                    var LenderROI = hospitalData.LenderROI
                } else {
                    var LenderTenure = 1.99;
                }
                var LenderApprovalAmount = (insurerAprovedAmount * LenderLTV) / 100;

                aggriSplitAmount =
                    (businessLogicsData.AggregetorLoan * LenderApprovalAmount) / 100;
                hospitalSplitAmount =
                    (businessLogicsData.HospitalLoan * LenderApprovalAmount) / 100;

                var date1 = new Date(claimSubmissionDate);
                var finalDate1 = new Date(date1.setDate(date1.getDate() + 1));
                claimSubmissionDate = new Date(finalDate1);

                var date2 = new Date(dateOfDischarge);
                var finalDate2 = new Date(date2.setDate(date2.getDate() + 1));
                dateOfDischarge = new Date(finalDate2);

                var date3 = new Date(dateOfAdmission);
                var finalDate3 = new Date(date3.setDate(date3.getDate() + 1));
                dateOfAdmission = new Date(finalDate3);

                var hospitalInterest = 0;
                hospitalInterest = Math.round(
                    (hospitalSplitAmount *
                        businessLogicsData.HospitalROI *
                        LenderTenure) /
                    (30 * 100)
                );

                var hospitalDisbursmentAmt = hospitalSplitAmount - hospitalInterest;

                var Interest = 0;
                var aggriInterest = 0;
                aggriInterest = Math.round(
                    (aggriSplitAmount *
                        businessLogicsData.AggregetorROI *
                        LenderTenure) /
                    (30 * 100)
                );

                var agriDisbursmentAmt = aggriSplitAmount - aggriInterest;

                Interest = hospitalInterest + aggriInterest;

                var AmountToBePaid = 0;
                AmountToBePaid = agriDisbursmentAmt + hospitalDisbursmentAmt;

                const usrObj = {
                    nameOfHospital,
                    TPAName,
                    insurerAprovedAmount,
                    InsuranceCompanyName,
                    claimId,
                    LTV,
                    LTVAmount,
                    nameOfInsurer,
                    finalBillNumber,
                    nameOfTPA,
                    policyNumber,
                    dateOfAdmission,
                    claimSubmissionDate,
                    claimAmount,
                    aggregatorId: userDetails._id,
                    hospitalId,
                    LenderId: hospitalData.LenderId, // validatorId,
                    dateOfDischarge,
                    invoiceDocumentUrl,
                    invoiceId,
                    Status: "DApproved",
                    insuranceApprovalLetter,
                    Description,
                    LenderLTV,
                    LenderTenure,
                    LenderROI,
                    LenderApprovalAmount,
                    DresponseDate: Date.now(),
                    // split disbursedamount hospitalamount
                    Interest: Interest,
                    isSplit: true,
                    aggriSplit: businessLogicsData.AggregetorLoan,
                    hospitalSplit: businessLogicsData.HospitalLoan,
                    aggriSplitAmount: aggriSplitAmount,
                    hospitalSplitAmount: hospitalSplitAmount,
                    hospitalROI: businessLogicsData.HospitalROI,
                    aggriROI: businessLogicsData.AggregetorROI,
                    hospitalDisbursmentAmt: hospitalDisbursmentAmt,
                    agriDisbursmentAmt: agriDisbursmentAmt,
                    aggriInterest: aggriInterest,
                    hospitalInterest: hospitalInterest,
                    totalIntrest: aggriInterest + hospitalInterest,
                    AmountToBePaid: AmountToBePaid,
                    AmountDisbursed: AmountToBePaid,
                    isDeleted: false
                };

                const newData = new this.Invoice(usrObj);
                const Invoicedata = await newData.save();
                return { data: { success: true, data: Invoicedata } };
            } else {
                return {
                    data: {
                        success: false,
                        message: "This hospital ia not for split disbursment",
                    }
                };
            }

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getCity(req: Request): Promise<{ data: any }> {
        try {
            const pincode = req.query.Pincode;
            const city = await this.CitiesModel.findOne({ Pincode: pincode });
            return {
                data: {
                    success: true,
                    message: city,
                }
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}
