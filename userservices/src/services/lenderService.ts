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
export default class lenderService {
    constructor(
        @Inject('userModel') private userModel: Models.UserModel,
        @Inject('ClaimInvoice') private Invoice: Models.ClaimInvoiceModel,
        @Inject('TransactionDataModel') private TransactionData: Models.TransactionDataModel,
        @Inject('businessLogics') private businessLogicsModel: Models.businessLogicsModel,
        @Inject('incrementValueModel') private IncrementValue: Models.incrementValueModel,
        @Inject('logger') private logger,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        private mailer: MailerService,
    ) { }

    public async getDashboardForLender(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            const hosdatas = await this.userModel.find({ LenderId: userDetails._id });
            var Repayments = 0;
            var TotalRepaymentsLimit = 0;
            var TotalinvoicesCount = 0;
            var TotalInvoicesAmount = 0;
            var TotalfundedCount = 0;
            var TotalRepaidCount = 0;
            var TotalPendingCount = 0;
            var TotalPendingAmount = 0;
            var TotalRejctedAmount = 0;
            var Repaymentlength = 0;
            var TotalfundedPaidAmount = 0;
            var TotalRepayment = 0;
            if (hosdatas) {
                var AllHospital = hosdatas.length;

                for (let i = 0; i < AllHospital; i++) {
                    const invoiceCount = await this.Invoice.find({
                        $and: [
                            { hospitalId: hosdatas[i]._id },
                            {
                                $or: [
                                    { Status: "Repaid" },
                                    { Status: "Funded" },
                                    { Status: "DApproved" },
                                    { Status: "LApproved" },
                                    { Status: "LRejected" },
                                ],
                            },
                        ],
                    });

                    if (invoiceCount) {
                        var Totalinvoices = invoiceCount.length;
                        TotalinvoicesCount = TotalinvoicesCount + Totalinvoices;

                        for (let l = 0; l < Totalinvoices; l++) {
                            var Amount = invoiceCount[l].LenderApprovalAmount;
                            if (Amount) {
                                TotalInvoicesAmount = TotalInvoicesAmount + Amount;
                            }
                        }
                    }

                    const fundedCount = await this.Invoice.find({
                        $and: [
                            { hospitalId: hosdatas[i]._id },
                            { $or: [{ RepaidStatus: "Repaid" }, { Status: "Funded" }] },
                        ],
                    });

                    if (fundedCount) {
                        var Totalfunded = fundedCount.length;
                        TotalfundedCount = TotalfundedCount + Totalfunded;

                        for (let k = 0; k < Totalfunded; k++) {
                            var Amounts = fundedCount[k].ApporvedAmount;
                            if (Amounts) {
                                TotalfundedPaidAmount = TotalfundedPaidAmount + Amounts;
                            }
                        }
                    }

                    const repaidInvoices = await this.Invoice.find({
                        $and: [{ hospitalId: hosdatas[i]._id }, { Status: "Repaid" }],
                    });

                    if (repaidInvoices) {
                        var TotalRepaid = repaidInvoices.length;
                        if (TotalRepaid) {
                            TotalRepaidCount = TotalRepaidCount + TotalRepaid;
                        }

                        for (let k = 0; k < TotalRepaid; k++) {
                            var DisbursedAmount = repaidInvoices[k].ApporvedAmount;
                            if (DisbursedAmount) {
                                TotalRepayment = TotalRepayment + DisbursedAmount;
                            }
                        }
                    }
                }
            }

            return {
                data: {
                    success: true,
                    TotalHospital: AllHospital,
                    Repaymentcount: TotalRepaidCount,
                    TotalRepaymentsAmount: TotalRepayment,
                    TotalinvoicesCount: TotalinvoicesCount,
                    TotalInvoicesAmount: TotalInvoicesAmount,
                    TotalfundedCount: TotalfundedCount,
                    TotalfundedPaidAmount: TotalfundedPaidAmount,
                }
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getInvoiceGraphToLender(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            var countInvoice = 0;
            var countInProcess = 0;
            var countDisbursed = 0;
            var countRejected = 0;
            var countRepaid = 0;
            var sum6 = 0;
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

            var Lenderdata = await this.userModel.find({ LenderId: userDetails._id });
            if (Lenderdata) {
                var len = Lenderdata.length;

                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: todaydate } },
                                                {
                                                    $or: [
                                                        { Status: "LRejected" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: todaydate } },
                                                { Status: "LRejected" },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumfive: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
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
            return {
                data: {
                    success: true,
                    Totalinvoicescount: countInvoice,
                    TotalcountInProcess: countInProcess,
                    TotalcountDisbursed: countDisbursed,
                    TotalcountRejected: countRejected,
                    TotalcountRepaid: countRepaid,
                }
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getLenderGraphAmount(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
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

            var Lenderdata = await this.userModel.find({ LenderId: userDetails._id });
            if (Lenderdata) {
                var len = Lenderdata.length;
                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: this1, $lte: todaydate } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumtwo: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m1, $lte: laster1 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m2, $lte: laster2 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m3, $lte: laster3 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumfive: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m4, $lte: laster4 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
                                ],
                                sumsix: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: laster5 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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

            return {
                data: {
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
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getLenderGraphOne(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
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

            var Lenderdata = await this.userModel.find({ LenderId: userDetails._id });
            if (Lenderdata) {
                var len = Lenderdata.length;

                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: this1, $lte: todaydate } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumtwo: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m1, $lte: laster1 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m2, $lte: laster2 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumfour: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m3, $lte: laster3 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m4, $lte: laster4 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumsix: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: laster5 } },
                                                {
                                                    $or: [
                                                        { Status: "Repaid" },
                                                        { Status: "Funded" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
                                                {
                                                    $or: [
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
                                                { hospitalId: Lenderdata[i]._id },
                                                { Status: "LRejected" },
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
            }
            return {
                data: {
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
                    InProcesss: [
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
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getSecondPieGraphForLender(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
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

            var Lenderdata = await this.userModel.find({ LenderId: userDetails._id });
            if (Lenderdata) {
                var len = Lenderdata.length;

                for (let i = 0; i < len; i++) {
                    var countone = await this.Invoice.aggregate([
                        {
                            $facet: {
                                sumone: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
                                                { createdAt: { $gte: d1m5, $lte: todaydate } },
                                                {
                                                    $or: [
                                                        { Status: "Funded" },
                                                        { RepaidStatus: "Repaid" },
                                                        { Status: "DApproved" },
                                                        { Status: "LApproved" },
                                                        { Status: "LRejected" },
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    { $count: "total" },
                                ],
                                sumtwo: [
                                    {
                                        $match: {
                                            $and: [
                                                { hospitalId: Lenderdata[i]._id },
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
                        countTotal = 0;
                    }
                    if (countone[0].sumtwo[0] != undefined) {
                        countFunded += countone[0].sumtwo[0].total;
                    } else {
                        countFunded = 0;
                    }
                }
            }
            return {
                data: {
                    success: true,
                    TotalInvoices: countTotal,
                    TotalFunded: countFunded,
                }
            };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAllInvoicesToLender(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
        try {
            //pagination
            var pageNumber = 1;
            var pageSize = 0;
            if (IFilterDTO.pageNumber) {
                var pageNumber = parseInt(IFilterDTO.pageNumber.toString());
            }
            if (IFilterDTO.pageSize) {
                var pageSize = parseInt(IFilterDTO.pageSize.toString());
            }
            //filters
            var searchFilters = [];
            // searchFilters.push({ isDeleted: false });
            searchFilters.push({ LenderId: currentUser._id });
            if (IFilterDTO.Status != undefined) {
                searchFilters.push({ Status: IFilterDTO.Status });
            }
            //mongo query
            var userCount = await this.Invoice.find({ $and: searchFilters }).countDocuments();
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var invoices = await this.Invoice
                .find({ $and: searchFilters })
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);
            var data = { invoices, numberOfPages };
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getInvoiceByIdToLender(req: Request, currentUser: IUser): Promise<{ data: any }> {
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
    public async getHospitalToLender(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
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
            searchFilters.push({ LenderId: currentUser._id, isDeleted: false });

            // for (var element of filters) {
            //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
            // }
            var userCount = await this.userModel.find({ $and: searchFilters }).countDocuments();
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var users = await this.userModel
                .find({ $and: searchFilters })
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            return { data: { success: true, message: users, numberOfPages } };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getHospitalByIdToLender(req: Request, currentUser: IUser): Promise<{ data: any }> {
        try {
            const ID = req.query._id;
            const userDetails = currentUser;
            var BusinessLogic = {};
            const invoices = await this.userModel.findOne({ _id: ID });
            if (invoices.isSplit != undefined) {
                if (invoices.isSplit == true) {
                    BusinessLogic = await this.businessLogicsModel.findOne({ hospitalId: ID });
                }
            }
            return {
                data: {
                    success: true,
                    data: BusinessLogic,
                    message: invoices,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getByIdToLender(req: Request, currentUser: IUser): Promise<{ data: any }> {
        try {
            const getLender = await this.userModel.findOne({ _id: currentUser._id });
            return {
                data: {
                    success: true,
                    message: getLender,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async editLenderProfile(req: Request, currentUser: IUser): Promise<{ data: any }> {
        try {
            const {
                name,
                mobileNumber,
                address,
                AadharNumber,
                AccountName,
                AccountNumber,
                NameOfTheBank,
                IFSCcode,
                Branch,
            } = req.body;

            const editLender = await this.userModel.findOne({ _id: currentUser._id });

            if (!editLender) {
                return {
                    data: {
                        success: false,
                        message: "Invalid Id!",
                    }
                };
            }
            let Lenderdata: any = {};

            if (mobileNumber) {
                Lenderdata.mobileNumber = mobileNumber;
            }
            if (address) {
                Lenderdata.address = address;
            }
            if (AccountName) {
                Lenderdata.AccountName = AccountName;
            }
            if (AccountNumber) {
                Lenderdata.AccountNumber = AccountNumber;
            }
            if (NameOfTheBank) {
                Lenderdata.NameOfTheBank = NameOfTheBank;
            }
            if (IFSCcode) {
                Lenderdata.IFSCcode = IFSCcode;
            }
            if (Branch) {
                Lenderdata.Branch = Branch;
            }
            if (name) {
                Lenderdata.name = name;
            }

            if (AadharNumber) {
                Lenderdata.AadharNumber = AadharNumber;
            }
            Lenderdata.updatedBy = currentUser._id;

            const accountNumbers = await this.userModel.find({
                AccountNumber: AccountNumber,
            });
            for (var doc of accountNumbers) {
                if (doc._id === currentUser._id) {
                    return {
                        data: {
                            message: " Account Number already exist",
                        }
                    };
                }
            }

            const lenderList = await this.userModel.updateOne(
                { _id: currentUser._id },
                { $set: Lenderdata },
                { useFindAndModify: false }
            );
            return {
                data: {
                    success: true,
                    message: "Lender Profile Updated Successfully",
                    editLender,
                }
            };
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
    public async getTransactionDataforLender(req: Request, currentUser: IUser): Promise<{ data: any }> {
        try {
            const hospitalId = req.query.hospitalId;
            const userDetails = currentUser;
            const Transactiondata = await this.TransactionData.find({
                hospialID: hospitalId,
            });
            return { data: { success: true, message: Transactiondata } };

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async postCreditLimitFromLender(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const hospitalId = req.query._id;
            const {
                ExistingCreditLimit,
                LTV,
                LenderTenure,
                HospitalROI,
                AggregatorROI,
                AggregetorLoan,
                HospitalLoan,
                LenderROI,
                LComment,
                LStatus,
            } = req.body;

            const vendorDetail = await this.businessLogicsModel.findOne({
                hospitalId: hospitalId,
            });
            const userDetail = await this.userModel.findOne({ _id: hospitalId });

            if (userDetail.isSplit == true) {
                let HosDetails: any = {};
                let user_Detail: any = {};

                if (ExistingCreditLimit) {
                    user_Detail.ExistingCreditLimit = ExistingCreditLimit;
                }
                if (LTV) {
                    user_Detail.LenderLTV = LTV;
                }
                if (LenderTenure) {
                    user_Detail.LenderTenure = LenderTenure;
                }
                if (HospitalROI) {
                    HosDetails.HospitalROI = HospitalROI;
                }
                if (HospitalLoan) {
                    HosDetails.HospitalLoan = HospitalLoan;
                }
                if (AggregatorROI) {
                    HosDetails.AggregetorROI = AggregatorROI;
                }
                if (AggregetorLoan) {
                    HosDetails.AggregetorLoan = AggregetorLoan;
                }
                if (LComment) {
                    user_Detail.LComment = LComment;
                }
                if (LStatus) {
                    user_Detail.LStatus = LStatus;
                }
                if (LenderROI) {
                    user_Detail.LenderROI = LenderROI;
                }

                var Rep = 0;
                var UTL = 0;
                if (userDetail.Repayment != undefined) {
                    Rep = userDetail.Repayment;
                }
                if (userDetail.UtilizedAmount != undefined) {
                    UTL = userDetail.UtilizedAmount;
                }

                if (ExistingCreditLimit != undefined) {
                    user_Detail.AvailableLimit = ExistingCreditLimit - UTL + Rep;
                }

                user_Detail.Repayment = 0;
                user_Detail.UtilizedAmount = 0;

                const data = await this.businessLogicsModel.findByIdAndUpdate(
                    { _id: vendorDetail._id },
                    { $set: HosDetails },
                    { new: true }
                );

                const UserData = await this.userModel.findByIdAndUpdate(
                    { _id: hospitalId },
                    { $set: user_Detail },
                    { new: true }
                );

                return { data: { success: true, message: data, UserData: UserData } };
            } else {
                let user_Detail: any = {};

                if (ExistingCreditLimit) {
                    user_Detail.ExistingCreditLimit = ExistingCreditLimit;
                }
                if (LTV) {
                    user_Detail.LenderLTV = LTV;
                }
                if (LenderTenure) {
                    user_Detail.LenderTenure = LenderTenure;
                }
                if (LenderROI) {
                    user_Detail.LenderROI = LenderROI;
                }
                if (LComment) {
                    user_Detail.LComment = LComment;
                }
                if (LStatus) {
                    user_Detail.LStatus = LStatus;
                }

                var Rep = 0;
                var UTL = 0;
                if (userDetail.Repayment != undefined) {
                    Rep = userDetail.Repayment;
                }
                if (userDetail.UtilizedAmount != undefined) {
                    UTL = userDetail.UtilizedAmount;
                }

                if (ExistingCreditLimit != undefined) {
                    user_Detail.AvailableLimit = ExistingCreditLimit - UTL + Rep;
                }

                user_Detail.Repayment = 0;
                user_Detail.UtilizedAmount = 0;

                const UserData = await this.userModel.findByIdAndUpdate(
                    { _id: hospitalId },
                    { $set: user_Detail },
                    { new: true }
                );

                return {
                    data: {
                        success: true,
                        message: "Successfully Update",
                        UserData: UserData,
                    }
                };
            }
        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
    public async calculateInterestfromLender(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _id, ApporvedAmount } = req.body;
            const userDetails = currentUser;

            const vendorDetail = await this.Invoice.findOne({ _id: _id });

            if (!vendorDetail) {
                return {
                    data: {
                        message: "Not a valid Vendor ID",
                    }
                };
            }
            if (vendorDetail.isSplit == true) {
                let anchorDetails: any = {};

                var hospitalInterest = 0;
                hospitalInterest = Math.round(
                    (vendorDetail.hospitalSplitAmount *
                        vendorDetail.hospitalROI *
                        vendorDetail.LenderTenure) /
                    (30 * 100)
                );

                var Interest = 0;
                var aggriInterest = 0;
                aggriInterest = Math.round(
                    (vendorDetail.aggriSplitAmount *
                        vendorDetail.aggriROI *
                        vendorDetail.LenderTenure) /
                    (30 * 100)
                );

                const PFdata = await this.IncrementValue.findOne({
                    _id: "5f3554892b1e6b1e388c37d5",
                });

                var PFFees = 0;
                PFFees = Math.round(
                    (ApporvedAmount * PFdata.PFfees * vendorDetail.LenderTenure) /
                    (30 * 100)
                );

                var AmountToBePaid = 0;
                AmountToBePaid =
                    ApporvedAmount - hospitalInterest - aggriInterest - PFFees;

                if (PFFees || PFFees == 0) {
                    anchorDetails.PFFees = PFFees;
                }

                if (hospitalInterest || hospitalInterest == 0) {
                    anchorDetails.hospitalInterest = hospitalInterest;
                }

                if (aggriInterest || aggriInterest == 0) {
                    anchorDetails.aggriInterest = aggriInterest;
                }

                if (AmountToBePaid || AmountToBePaid == 0) {
                    anchorDetails.AmountToBePaid = AmountToBePaid;
                    anchorDetails.Interest = aggriInterest + hospitalInterest;
                }

                return { data: { success: true, message: anchorDetails } };
            } else {
                let anchorDetails: any = {};

                var Interest = 0;
                Interest = Math.round(
                    (ApporvedAmount *
                        vendorDetail.LenderROI *
                        vendorDetail.LenderTenure) /
                    (30 * 100)
                );

                const PFdata = await this.IncrementValue.findOne({
                    _id: "5f3554892b1e6b1e388c37d5",
                });

                var PFFees = 0;
                PFFees = Math.round(
                    (ApporvedAmount * PFdata.PFfees * vendorDetail.LenderTenure) /
                    (30 * 100)
                );

                var AmountToBePaid = 0;
                AmountToBePaid = ApporvedAmount - Interest - PFFees;

                if (PFFees || PFFees == 0) {
                    anchorDetails.PFFees = PFFees;
                }

                if (Interest || Interest == 0) {
                    anchorDetails.Interest = Interest;
                }
                if (AmountToBePaid || AmountToBePaid == 0) {
                    anchorDetails.AmountToBePaid = AmountToBePaid;
                }

                return { data: { success: true, message: anchorDetails } };
            }

        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
    public async postFromLender(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const {
                _id,
                LenderComment,
                ApporvedAmount,
                PFFees,
                Interest,
                AmountToBePaid,
            } = req.body;

            const userDetails = currentUser;

            const vendorDetail = await this.Invoice.findOne({ _id: _id });

            if (vendorDetail.isSplit == true) {
                let anchorDetails: any = {};
                anchorDetails.LresponseDate = new Date();
                anchorDetails.Status = "LApproved";
                if (ApporvedAmount) {
                    anchorDetails.ApporvedAmount = ApporvedAmount;
                }
                if (LenderComment) {
                    anchorDetails.LenderComment = LenderComment;
                }

                const invoices = await this.Invoice.updateOne(
                    { _id },
                    { $set: anchorDetails }
                );
                return { data: { success: true, message: "Succesfully Update" } };
            }

            if (!vendorDetail) {
                return {
                    data: {
                        message: "Not a valid Vendor ID",
                    }
                };
            }

            let anchorDetails: any = {};
            anchorDetails.LresponseDate = new Date();
            anchorDetails.Status = "LApproved";

            if (ApporvedAmount) {
                //anchorDetails.ApporvedAmount= vendorDetail.hospitalDisbursmentAmt   +   avendorDetail.griDisbursmentAmt
                anchorDetails.ApporvedAmount = ApporvedAmount;
            }

            if (LenderComment) {
                anchorDetails.LenderComment = LenderComment;
            }

            if (PFFees || PFFees == 0) {
                anchorDetails.PFFees = PFFees;
            }

            if (Interest) {
                anchorDetails.Interest = Interest;
            }
            if (AmountToBePaid) {
                anchorDetails.AmountToBePaid = AmountToBePaid;
            }

            const invoices = await this.Invoice.updateOne(
                { _id },
                { $set: anchorDetails }
            );

            return { data: { success: true, message: "Succesfully Update" } };

        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
    public async postRejectedFromLender(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _id, LenderComment } = req.body;
            const userDetails = req.currentUser;

            const vendorDetail = await this.Invoice.findOne({ _id: _id });

            if (!vendorDetail) {
                return {
                    data: {
                        message: "Not a valid Invoice ID",
                    }
                };
            }
            let anchorDetails: any = {};
            anchorDetails.LresponseDate = new Date();
            anchorDetails.Status = "LRejected";

            if (LenderComment) {
                anchorDetails.LenderComment = LenderComment;
            }

            const invoices = await this.Invoice.updateOne(
                { _id },
                { $set: anchorDetails }
            );

            return { data: { success: true, message: "Successfully Rejected" } };

        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
    public async fundedFromLenderDisbursed(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _id, AmountDisbursed, NEFT_RTG, PaymentDate } = req.body;
            const userDetails = currentUser;

            const fundedDetail = await this.Invoice.findOne({ _id: _id });

            if (!fundedDetail) {
                return {
                    data: {
                        message: "Not a valid ID",
                    }
                };
            }
            const xy = await this.IncrementValue.findById({
                _id: "5f3554892b1e6b1e388c37d5",
            });
            var incrementedValue = xy.countPlus + 1;
            const updateCount = await this.IncrementValue.findByIdAndUpdate(
                { _id: "5f3554892b1e6b1e388c37d5" },
                { $set: { countPlus: incrementedValue } },
                { useFindAndModify: false }
            );

            let updateDetails: any = {};
            updateDetails.FundedDate = new Date();
            updateDetails.Status = "Funded";
            updateDetails.Fundedloanid = incrementedValue;

            if (fundedDetail.isSplit != true) {
                if (AmountDisbursed) {
                    updateDetails.AmountDisbursed = AmountDisbursed;
                }
            }

            if (NEFT_RTG) {
                updateDetails.NEFT_RTG = NEFT_RTG;
            }

            if (PaymentDate) {
                var date1 = new Date(PaymentDate);
                var finalDate1 = new Date(date1.setDate(date1.getDate() + 1));
                updateDetails.PaymentDate = new Date(finalDate1);
            }

            const hosDetail = await this.userModel.findOne({
                _id: fundedDetail.hospitalId,
            });
            var date = new Date(PaymentDate);
            var y = date.setDate(date.getDate() + hosDetail.LenderTenure + 1);
            var DueDate;
            updateDetails.DueDate = new Date(y);

            if (hosDetail.UtilizedAmount != undefined) {
                var utilizedLimit = hosDetail.UtilizedAmount;
            }

            var UtilizedAmount = 0;
            UtilizedAmount = utilizedLimit + fundedDetail.ApporvedAmount;

            if (hosDetail.Repayment != undefined) {
                var AvailableLimit =
                    hosDetail.ExistingCreditLimit -
                    UtilizedAmount +
                    hosDetail.Repayment;
            }
            if (AvailableLimit < 0) {
                return {
                    data: {
                        success: false,
                        error: "Available Limit is Less than paid amount",
                    }
                };
            }
            const updtvendor = await this.userModel.updateOne(
                { _id: fundedDetail.hospitalId },
                {
                    $set: {
                        UtilizedAmount: UtilizedAmount,
                        AvailableLimit: AvailableLimit,
                    },
                }
            );
            const invoices = await this.Invoice.updateOne(
                { _id: _id },
                { $set: updateDetails }
            );
            return { data: { success: true, message: "Succesfully Update" } };
        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
    public async postRepaidFromLender(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const { _id, AmountReceived, PaymentReceivedDate, ReceivedNEFT_RTG } =
                req.body;

            const userDetails = currentUser;

            const vendorDetail = await this.Invoice.findOne({ _id: _id });
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

            if (AmountReceived) {
                anchorDetails.AmountReceived = AmountReceived;
            }
            if (PaymentReceivedDate) {
                var date1 = new Date(PaymentReceivedDate);
                var finalDate1 = new Date(date1.setDate(date1.getDate() + 1));
                anchorDetails.PaymentReceivedDate = new Date(finalDate1);
            }
            if (ReceivedNEFT_RTG) {
                anchorDetails.ReceivedNEFT_RTG = ReceivedNEFT_RTG;
            }

            const hosDetail = await this.userModel.findOne({ _id: vendorDetail.hospitalId });

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
            var PFFees;
            PFFees = vendorDetail.PFFees;
            var AmountToBePaid;
            AmountToBePaid = vendorDetail.AmountToBePaid;

            var AdditionalInterest = 0;
            if (AdditionalDays >= 0) {
                AdditionalInterest = Math.round(
                    (ApporvedAmount * hosDetail.LenderROI * AdditionalDays) / (30 * 100)
                );
                anchorDetails.AdditionalDays = AdditionalDays;
            } else {
                anchorDetails.AdditionalDays = 0;
            }

            var RemainingAmount = 0;
            var PastRecovery = 0;

            var TotalDeduction = Math.round(ApporvedAmount + AdditionalInterest);
            var BalanceAmount = Math.round(TotalDeduction + PastRecovery);

            RemainingAmount = Math.round(AmountReceived - BalanceAmount);

            if (BalanceAmount == AmountReceived) {
                anchorDetails.SettleStatus = "FullPaid";
            } else if (BalanceAmount < AmountReceived) {
                anchorDetails.SettleStatus = "OverPaid";
            } else {
                anchorDetails.SettleStatus = "UnderPaid";
            }
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
            return { data: { success: true, message: "Succesfully Update" } };

        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
    public async repaymentConfirmation(req, currentUser: IUser): Promise<{ data: any }> {
        try {
            const _id = req.query._id;
            const userDetails = currentUser;

            const invoiceDetail = await this.Invoice.findOne({ _id: _id });
            if (!invoiceDetail) {
                return {
                    data: {
                        message: "Not a valid invoice ID",
                    }
                };
            }
            let anchorDetails: any = {};
            // anchorDetails.LresponseDate = new Date();
            anchorDetails.RepaidStatus = "RepaymentConfirmed";

            const invoices = await this.Invoice.updateOne(
                { _id: _id },
                { $set: anchorDetails }
            );

            return { data: { success: true, message: "Succesfully Update" } };
        } catch (error) {
            this.logger.error(error);
            return {
                data: { success: false, error: error }
            }
        }
    }
}