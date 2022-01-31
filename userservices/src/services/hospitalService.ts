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
export default class hospitalService {
    constructor(
        @Inject('userModel') private userModel: Models.UserModel,
        @Inject('ClaimInvoice') private Invoice: Models.ClaimInvoiceModel,
        @Inject('TransactionDataModel') private TransactionData: Models.TransactionDataModel,
        @Inject('businessLogics') private businessLogicsModel: Models.businessLogicsModel,
        @Inject('InsuranceMasterModel') private InsuranceModel: Models.InsuranceMasterModel,
        @Inject('TPAMasterModel') private TPAModel: Models.TPAMasterModel,
        @Inject('LTVMasterModel') private ltvModel: Models.LTVMasterModel,
        @Inject('logger') private logger,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        private mailer: MailerService,
    ) { }

    public async getDashboardForHospital(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            var Totalinvoices = 0;
            var TotalClaimsUploaded = 0;
            var Totalpendinginvoices = 0;
            var TotalLoansInProcess = 0;
            var TotalRejectedinvoices = 0;
            var TotalRejectedLoans = 0;
            var fundedInvoiceLength = 0;
            var TotalFundedClaimamount = 0;
            var repaidLenth = 0;

            var countone = await this.Invoice.aggregate([{
                $facet: {
                    "sumone": [{ $match: { $and: [{ hospitalId: userDetails._id }] } }, { $count: "total" }],
                    "sum1": [{ $match: { $and: [{ hospitalId: userDetails._id }] } }, { $group: { _id: "$_v", total: { $sum: "$LenderApprovalAmount" } } }],
                    "sumtwo": [{ $match: { $and: [{ hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "DApproved" }, { Status: "LApproved" }, { Status: "Validated" }] }] } }, { $count: "total" }],
                    "sum2": [{ $match: { $and: [{ hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "DApproved" }, { Status: "LApproved" }, { Status: "Validated" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$LenderApprovalAmount" } } }],
                    "sumthree": [{ $match: { $and: [{ hospitalId: userDetails._id }, { $or: [{ Status: "DRejected" }, { Status: "LRejected" }, { Status: "VRejected" }] }] } }, { $count: "total" }],
                    "sum3": [{ $match: { $and: [{ hospitalId: userDetails._id }, { $or: [{ Status: "DRejected" }, { Status: "LRejected" }, { Status: "VRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$LenderApprovalAmount" } } }],
                    "sumfour": [{ $match: { $and: [{ hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "sum4": [{ $match: { $and: [{ hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$LenderApprovalAmount" } } }],
                    "sumfive": [{ $match: { $and: [{ hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],
                }
            }])

            if (countone[0].sumone[0] != undefined) { Totalinvoices = countone[0].sumone[0].total; } else { Totalinvoices = 0; }
            if (countone[0].sum1[0] != undefined) { TotalClaimsUploaded = countone[0].sum1[0].total; } else { TotalClaimsUploaded = 0; }
            if (countone[0].sumtwo[0] != undefined) { Totalpendinginvoices = countone[0].sumtwo[0].total; } else { Totalpendinginvoices = 0; }
            if (countone[0].sum2[0] != undefined) { TotalLoansInProcess = countone[0].sum2[0].total; } else { TotalLoansInProcess = 0; }
            if (countone[0].sumthree[0] != undefined) { TotalRejectedinvoices = countone[0].sumthree[0].total; } else { TotalRejectedinvoices = 0; }
            if (countone[0].sum3[0] != undefined) { TotalRejectedLoans = countone[0].sum3[0].total; } else { TotalRejectedLoans = 0; }
            if (countone[0].sumfour[0] != undefined) { fundedInvoiceLength = countone[0].sumfour[0].total; } else { fundedInvoiceLength = 0; }
            if (countone[0].sum4[0] != undefined) { TotalFundedClaimamount = countone[0].sum4[0].total; } else { TotalFundedClaimamount = 0; }
            if (countone[0].sumfive[0] != undefined) { repaidLenth = countone[0].sumfive[0].total; } else { repaidLenth = 0; }

            return {
                data: {
                    success: true,
                    UtilizedAmount: userDetails.UtilizedAmount,
                    TotalAvailableLimit: userDetails.AvailableLimit,
                    CreditLimit: userDetails.ExistingCreditLimit,
                    Repayment: userDetails.Repayment,
                    repaidInvoiceCount: repaidLenth,
                    TotalUploadedInvoices: Totalinvoices,
                    TotalUploadedInvoicesClaimAmount: TotalClaimsUploaded,
                    TotalPendingInvoices: Totalpendinginvoices,
                    TotalPendingInvoicesCLaimAmount: TotalLoansInProcess,
                    TotalRejectedInvoices: TotalRejectedinvoices,
                    TotalRejectedInvoicesClaimAmount: TotalRejectedLoans,
                    TotalfundedInvoices: fundedInvoiceLength,
                    TotalFundedClaimamount: TotalFundedClaimamount
                }
            }
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getInvoiceGraphToHospital(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            var countInvoice = 0;
            var countInProcess = 0;
            var countDisbursed = 0;
            var countRejected = 0;
            var sum5 = 0;
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
            laster1.setHours(23, 59, 59, 0)

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
            laster3.setHours(23, 59, 59, 0)

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0)

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0)

            var todaydate = new Date();
            var countone = await this.Invoice.aggregate([{
                $facet: {
                    "sumone": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: todaydate } }] } }, { $count: "total" }],
                    "sumtwo": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: todaydate } }, { $or: [{ Status: "Pending" }, { Status: "DApproved" }, { Status: "LApproved" }, { Status: "Validated" }] }] } }, { $count: "total" }],
                    "sumthree": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: todaydate } }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "sumfour": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: todaydate } }, { $or: [{ Status: "DRejected" }, { Status: "LRejected" }, { Status: "VRejected" }] }] } }, { $count: "total" }],
                }
            }])

            if (countone[0].sumone[0] != undefined) { countInvoice = countone[0].sumone[0].total; } else { countInvoice = 0; }
            if (countone[0].sumtwo[0] != undefined) { countInProcess = countone[0].sumtwo[0].total; } else { countInProcess = 0; }
            if (countone[0].sumthree[0] != undefined) { countDisbursed = countone[0].sumthree[0].total; } else { countDisbursed = 0; }
            if (countone[0].sumfour[0] != undefined) { countRejected = countone[0].sumfour[0].total; } else { countRejected = 0; }

            return {
                data: {
                    success: true,
                    Totalinvoicescount: countInvoice,
                    TotalcountInProcess: countInProcess,
                    TotalcountDisbursed: countDisbursed,
                    TotalcountRejected: countRejected,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getHospitalGraphAmount(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = req.currentUser;
            var sum1 = 0; var sum2 = 0; var sum3 = 0; var sum4 = 0; var sum5 = 0; var sum6 = 0;

            var InProcesssum1 = 0; var InProcesssum2 = 0; var InProcesssum3 = 0;
            var InProcesssum4 = 0; var InProcesssum5 = 0; var InProcesssum6 = 0;
            var Disbursedsum1 = 0; var Disbursedsum2 = 0; var Disbursedsum3 = 0;
            var Disbursedsum4 = 0; var Disbursedsum5 = 0; var Disbursedsum6 = 0;
            var Repaidsum1 = 0; var Repaidsum2 = 0; var Repaidsum3 = 0;
            var Repaidsum4 = 0; var Repaidsum5 = 0; var Repaidsum6 = 0;
            var Rejectedsum1 = 0; var Rejectedsum2 = 0; var Rejectedsum3 = 0;
            var Rejectedsum4 = 0; var Rejectedsum5 = 0; var Rejectedsum6 = 0;
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
            laster1.setHours(23, 59, 59, 0)
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
            laster3.setHours(23, 59, 59, 0)

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0)

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
            var countone = await this.Invoice.aggregate([{
                $facet: {
                    "sumone": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: this1, $lte: todaydate } }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "sumtwo": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m1, $lte: laster1 } }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "sumthree": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m2, $lte: laster2 } }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "sumfour": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m3, $lte: laster3 } }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "sumfive": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m4, $lte: laster4 } }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "sumsix": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: laster5 } }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],

                    "InProsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "InProsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "InProsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "InProsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "InProsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "InProsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],

                    "Disbursedsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Disbursedsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Disbursedsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Disbursedsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Disbursedsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Disbursedsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],

                    "Repaidsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Repaidsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Repaidsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Repaidsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Repaidsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Repaidsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],

                    "Rejectedsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Rejectedsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Rejectedsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Rejectedsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Rejectedsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
                    "Rejectedsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }]
                }
            }])

            if (countone[0].sumone[0] != undefined) { sum1 += countone[0].sumone[0].total; } else { sum1 += 0; }
            if (countone[0].sumtwo[0] != undefined) { sum2 += countone[0].sumtwo[0].total; } else { sum2 += 0; }
            if (countone[0].sumthree[0] != undefined) { sum3 += countone[0].sumthree[0].total; } else { sum3 += 0; }
            if (countone[0].sumfour[0] != undefined) { sum4 += countone[0].sumfour[0].total; } else { sum4 += 0; }
            if (countone[0].sumfive[0] != undefined) { sum5 += countone[0].sumfive[0].total; } else { sum5 += 0; }
            if (countone[0].sumsix[0] != undefined) { sum6 += countone[0].sumsix[0].total; } else { sum6 += 0; }

            if (countone[0].InProsumone[0] != undefined) { InProcesssum1 += countone[0].InProsumone[0].total; } else { InProcesssum1 += 0; }
            if (countone[0].InProsumtwo[0] != undefined) { InProcesssum2 += countone[0].InProsumtwo[0].total; } else { InProcesssum2 += 0; }
            if (countone[0].InProsumthree[0] != undefined) { InProcesssum3 += countone[0].InProsumthree[0].total; } else { InProcesssum3 += 0; }
            if (countone[0].InProsumfour[0] != undefined) { InProcesssum4 += countone[0].InProsumfour[0].total; } else { InProcesssum4 += 0; }
            if (countone[0].InProsumfive[0] != undefined) { InProcesssum5 += countone[0].InProsumfive[0].total; } else { InProcesssum5 += 0; }
            if (countone[0].InProsumsix[0] != undefined) { InProcesssum6 += countone[0].InProsumsix[0].total; } else { InProcesssum6 += 0; }

            if (countone[0].Disbursedsumone[0] != undefined) { Disbursedsum1 += countone[0].Disbursedsumone[0].total; } else { Disbursedsum1 += 0; }
            if (countone[0].Disbursedsumtwo[0] != undefined) { Disbursedsum2 += countone[0].Disbursedsumtwo[0].total; } else { Disbursedsum2 += 0; }
            if (countone[0].Disbursedsumthree[0] != undefined) { Disbursedsum3 += countone[0].Disbursedsumthree[0].total; } else { Disbursedsum3 += 0; }
            if (countone[0].Disbursedsumfour[0] != undefined) { Disbursedsum4 += countone[0].Disbursedsumfour[0].total; } else { Disbursedsum4 += 0; }
            if (countone[0].Disbursedsumfive[0] != undefined) { Disbursedsum5 += countone[0].Disbursedsumfive[0].total; } else { Disbursedsum5 += 0; }
            if (countone[0].Disbursedsumsix[0] != undefined) { Disbursedsum6 += countone[0].Disbursedsumsix[0].total; } else { Disbursedsum6 += 0; }

            if (countone[0].Repaidsumone[0] != undefined) { Repaidsum1 += countone[0].Repaidsumone[0].total; } else { Repaidsum1 += 0; }
            if (countone[0].Repaidsumtwo[0] != undefined) { Repaidsum2 += countone[0].Repaidsumtwo[0].total; } else { Repaidsum2 += 0; }
            if (countone[0].Repaidsumthree[0] != undefined) { Repaidsum3 += countone[0].Repaidsumthree[0].total; } else { Repaidsum3 += 0; }
            if (countone[0].Repaidsumfour[0] != undefined) { Repaidsum4 += countone[0].Repaidsumfour[0].total; } else { Repaidsum4 += 0; }
            if (countone[0].Repaidsumfive[0] != undefined) { Repaidsum5 += countone[0].Repaidsumfive[0].total; } else { Repaidsum5 += 0; }
            if (countone[0].Repaidsumsix[0] != undefined) { Repaidsum6 += countone[0].Repaidsumsix[0].total; } else { Repaidsum6 += 0; }

            if (countone[0].Rejectedsumone[0] != undefined) { Rejectedsum1 += countone[0].Rejectedsumone[0].total; } else { Rejectedsum1 += 0; }
            if (countone[0].Rejectedsumtwo[0] != undefined) { Rejectedsum2 += countone[0].Rejectedsumtwo[0].total; } else { Rejectedsum2 += 0; }
            if (countone[0].Rejectedsumthree[0] != undefined) { Rejectedsum3 += countone[0].Rejectedsumthree[0].total; } else { Rejectedsum3 += 0; }
            if (countone[0].Rejectedsumfour[0] != undefined) { Rejectedsum4 += countone[0].Rejectedsumfour[0].total; } else { Rejectedsum4 += 0; }
            if (countone[0].Rejectedsumfive[0] != undefined) { Rejectedsum5 += countone[0].Rejectedsumfive[0].total; } else { Rejectedsum5 += 0; }
            if (countone[0].Rejectedsumsix[0] != undefined) { Rejectedsum6 += countone[0].Rejectedsumsix[0].total; } else { Rejectedsum6 += 0; }

            return {
                data: {
                    success: true,
                    monthsAndYears: [[thismonth, t], [month1, a], [month2, b], [month3, c], [month4, d], [month5, e]],
                    All: [sum1, sum2, sum3, sum4, sum5, sum6],
                    InProcess: [InProcesssum1, InProcesssum2, InProcesssum3, InProcesssum4, InProcesssum5, InProcesssum6],
                    Disbursed: [Disbursedsum1, Disbursedsum2, Disbursedsum3, Disbursedsum4, Disbursedsum5, Disbursedsum6],
                    Repaid: [Repaidsum1, Repaidsum2, Repaidsum3, Repaidsum4, Repaidsum5, Repaidsum6],
                    Rejected: [Rejectedsum1, Rejectedsum2, Rejectedsum3, Rejectedsum4, Rejectedsum5, Rejectedsum6],
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getHospitalGraphOne(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = req.currentUser;

            var sum1 = 0; var sum2 = 0; var sum3 = 0; var sum4 = 0; var sum5 = 0; var sum6 = 0;

            var InProcesssum1 = 0; var InProcesssum2 = 0; var InProcesssum3 = 0;
            var InProcesssum4 = 0; var InProcesssum5 = 0; var InProcesssum6 = 0;

            var Disbursedsum1 = 0; var Disbursedsum2 = 0; var Disbursedsum3 = 0;
            var Disbursedsum4 = 0; var Disbursedsum5 = 0; var Disbursedsum6 = 0;

            var Repaidsum1 = 0; var Repaidsum2 = 0; var Repaidsum3 = 0;
            var Repaidsum4 = 0; var Repaidsum5 = 0; var Repaidsum6 = 0;

            var Rejectedsum1 = 0; var Rejectedsum2 = 0; var Rejectedsum3 = 0;
            var Rejectedsum4 = 0; var Rejectedsum5 = 0; var Rejectedsum6 = 0;
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
            laster1.setHours(23, 59, 59, 0)
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
            laster3.setHours(23, 59, 59, 0)

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0)

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0)

            var todaydate = new Date();
            var countone = await this.Invoice.aggregate([{
                $facet: {
                    "sumone": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: this1, $lte: todaydate } }] } }, { $count: "total" }],
                    "sumtwo": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m1, $lte: laster1 } }] } }, { $count: "total" }],
                    "sumthree": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m2, $lte: laster2 } }] } }, { $count: "total" }],
                    "sumfour": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m3, $lte: laster3 } }] } }, { $count: "total" }],
                    "sumfive": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m4, $lte: laster4 } }] } }, { $count: "total" }],
                    "sumsix": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: laster5 } }] } }, { $count: "total" }],

                    "InProsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
                    "InProsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
                    "InProsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
                    "InProsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
                    "InProsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
                    "InProsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Pending" }, { Status: "Validated" }, { Status: "DApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],

                    "Disbursedsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "Disbursedsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "Disbursedsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "Disbursedsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "Disbursedsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                    "Disbursedsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],

                    "Repaidsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],
                    "Repaidsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],
                    "Repaidsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],
                    "Repaidsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],
                    "Repaidsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],
                    "Repaidsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { Status: "Repaid" }] } }, { $count: "total" }],

                    "Rejectedsumone": [{ $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
                    "Rejectedsumtwo": [{ $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
                    "Rejectedsumthree": [{ $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
                    "Rejectedsumfour": [{ $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
                    "Rejectedsumfive": [{ $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
                    "Rejectedsumsix": [{ $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { hospitalId: userDetails._id }, { $or: [{ Status: "VRejected" }, { Status: "DRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }]
                }
            }])

            if (countone[0].sumone[0] != undefined) { sum1 += countone[0].sumone[0].total; } else { sum1 += 0; }
            if (countone[0].sumtwo[0] != undefined) { sum2 += countone[0].sumtwo[0].total; } else { sum2 += 0; }
            if (countone[0].sumthree[0] != undefined) { sum3 += countone[0].sumthree[0].total; } else { sum3 += 0; }
            if (countone[0].sumfour[0] != undefined) { sum4 += countone[0].sumfour[0].total; } else { sum4 += 0; }
            if (countone[0].sumfive[0] != undefined) { sum5 += countone[0].sumfive[0].total; } else { sum5 += 0; }
            if (countone[0].sumsix[0] != undefined) { sum6 += countone[0].sumsix[0].total; } else { sum6 += 0; }

            if (countone[0].InProsumone[0] != undefined) { InProcesssum1 += countone[0].InProsumone[0].total; } else { InProcesssum1 += 0; }
            if (countone[0].InProsumtwo[0] != undefined) { InProcesssum2 += countone[0].InProsumtwo[0].total; } else { InProcesssum2 += 0; }
            if (countone[0].InProsumthree[0] != undefined) { InProcesssum3 += countone[0].InProsumthree[0].total; } else { InProcesssum3 += 0; }
            if (countone[0].InProsumfour[0] != undefined) { InProcesssum4 += countone[0].InProsumfour[0].total; } else { InProcesssum4 += 0; }
            if (countone[0].InProsumfive[0] != undefined) { InProcesssum5 += countone[0].InProsumfive[0].total; } else { InProcesssum5 += 0; }
            if (countone[0].InProsumsix[0] != undefined) { InProcesssum6 += countone[0].InProsumsix[0].total; } else { InProcesssum6 += 0; }

            if (countone[0].Disbursedsumone[0] != undefined) { Disbursedsum1 += countone[0].Disbursedsumone[0].total; } else { Disbursedsum1 += 0; }
            if (countone[0].Disbursedsumtwo[0] != undefined) { Disbursedsum2 += countone[0].Disbursedsumtwo[0].total; } else { Disbursedsum2 += 0; }
            if (countone[0].Disbursedsumthree[0] != undefined) { Disbursedsum3 += countone[0].Disbursedsumthree[0].total; } else { Disbursedsum3 += 0; }
            if (countone[0].Disbursedsumfour[0] != undefined) { Disbursedsum4 += countone[0].Disbursedsumfour[0].total; } else { Disbursedsum4 += 0; }
            if (countone[0].Disbursedsumfive[0] != undefined) { Disbursedsum5 += countone[0].Disbursedsumfive[0].total; } else { Disbursedsum5 += 0; }
            if (countone[0].Disbursedsumsix[0] != undefined) { Disbursedsum6 += countone[0].Disbursedsumsix[0].total; } else { Disbursedsum6 += 0; }

            if (countone[0].Repaidsumone[0] != undefined) { Repaidsum1 += countone[0].Repaidsumone[0].total; } else { Repaidsum1 += 0; }
            if (countone[0].Repaidsumtwo[0] != undefined) { Repaidsum2 += countone[0].Repaidsumtwo[0].total; } else { Repaidsum2 += 0; }
            if (countone[0].Repaidsumthree[0] != undefined) { Repaidsum3 += countone[0].Repaidsumthree[0].total; } else { Repaidsum3 += 0; }
            if (countone[0].Repaidsumfour[0] != undefined) { Repaidsum4 += countone[0].Repaidsumfour[0].total; } else { Repaidsum4 += 0; }
            if (countone[0].Repaidsumfive[0] != undefined) { Repaidsum5 += countone[0].Repaidsumfive[0].total; } else { Repaidsum5 += 0; }
            if (countone[0].Repaidsumsix[0] != undefined) { Repaidsum6 += countone[0].Repaidsumsix[0].total; } else { Repaidsum6 += 0; }

            if (countone[0].Rejectedsumone[0] != undefined) { Rejectedsum1 += countone[0].Rejectedsumone[0].total; } else { Rejectedsum1 += 0; }
            if (countone[0].Rejectedsumtwo[0] != undefined) { Rejectedsum2 += countone[0].Rejectedsumtwo[0].total; } else { Rejectedsum2 += 0; }
            if (countone[0].Rejectedsumthree[0] != undefined) { Rejectedsum3 += countone[0].Rejectedsumthree[0].total; } else { Rejectedsum3 += 0; }
            if (countone[0].Rejectedsumfour[0] != undefined) { Rejectedsum4 += countone[0].Rejectedsumfour[0].total; } else { Rejectedsum4 += 0; }
            if (countone[0].Rejectedsumfive[0] != undefined) { Rejectedsum5 += countone[0].Rejectedsumfive[0].total; } else { Rejectedsum5 += 0; }
            if (countone[0].Rejectedsumsix[0] != undefined) { Rejectedsum6 += countone[0].Rejectedsumsix[0].total; } else { Rejectedsum6 += 0; }

            return {
                data: {
                    success: true,
                    monthsAndYears: [[thismonth, t], [month1, a], [month2, b], [month3, c], [month4, d], [month5, e]],
                    All: [sum1, sum2, sum3, sum4, sum5, sum6],
                    InProcess: [InProcesssum1, InProcesssum2, InProcesssum3, InProcesssum4, InProcesssum5, InProcesssum6],
                    Disbursed: [Disbursedsum1, Disbursedsum2, Disbursedsum3, Disbursedsum4, Disbursedsum5, Disbursedsum6],
                    Repaid: [Repaidsum1, Repaidsum2, Repaidsum3, Repaidsum4, Repaidsum5, Repaidsum6],
                    Rejected: [Rejectedsum1, Rejectedsum2, Rejectedsum3, Rejectedsum4, Rejectedsum5, Rejectedsum6],
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getSecondPieGraphForHospital(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = req.currentUser;

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
            laster1.setHours(23, 59, 59, 0)

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
            laster3.setHours(23, 59, 59, 0)

            var month4 = forcalc.getMonth() - 1;
            if (month4 < 0) {
                month4 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month4);
            var d = forcalc.getFullYear();
            var d1m4 = new Date(d, month4 - 1, 1);
            var laster4 = new Date(d, month4, 0);
            laster4.setHours(23, 59, 59, 0)

            var month5 = forcalc.getMonth() - 1;
            if (month5 < 0) {
                month5 += 12;
                forcalc.setFullYear(forcalc.getFullYear() - 1);
            }
            forcalc.setMonth(month5);
            var e = forcalc.getFullYear();
            var d1m5 = new Date(e, month5 - 1, 1);
            var laster5 = new Date(e, month5, 0);
            laster5.setHours(23, 59, 59, 0)

            var todaydate = new Date();

            var countTotal = 0;
            var countFunded = 0;

            var countone = await this.Invoice.aggregate([{
                $facet: {
                    "sumone": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: todaydate } }] } }, { $count: "total" }],
                    "sumtwo": [{ $match: { $and: [{ hospitalId: userDetails._id }, { createdAt: { $gte: d1m5, $lte: todaydate } }, { $or: [{ Status: "Funded" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
                }
            }])

            if (countone[0].sumone[0] != undefined) { countTotal = countone[0].sumone[0].total; } else { countTotal = 0; }
            if (countone[0].sumtwo[0] != undefined) { countFunded = countone[0].sumtwo[0].total; } else { countFunded = 0; }

            return {
                data: {
                    success: true,
                    TotalInvoices: countTotal,
                    TotalFunded: countFunded
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getFundedInvoiceToHospital(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
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
            searchFilters.push({ hospitalId: currentUser._id }, { Status: 'Funded' });
            // for (var element of filters) {
            //   searchFilters.push({ [element.searchField]: { $regex: element.searchTerm, $options: 'i' } });
            // }
            var userCount = await this.Invoice.find({ $and: searchFilters }).countDocuments();
            var numberOfPages = pageSize === 0 ? 1 : Math.ceil(userCount / pageSize);
            var fundedHospital = await this.Invoice
                .find({ $and: searchFilters })
                .sort({ updatedAt: -1 })
                .skip((pageNumber - 1) * pageSize)
                .limit(pageSize);

            return { data: { success: true, count: userCount, message: fundedHospital, numberOfPages } }
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
    public async getByIdToHospital(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            const getHospital = await this.userModel.findById({ _id: userDetails._id });
            if (!getHospital) {
                return {
                    data: {
                        message: "Not a valid Id or deleted Id",
                    }
                };
            }
            const validatorDetail = await this.userModel.findOne({
                hospitalId: getHospital._id,
            });
            return {
                data: {
                    success: true,
                    message: getHospital,
                    validatorDetail: validatorDetail,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async editHospitalPersonalInfo(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            const userDetails = currentUser;
            const {
                DateOfRegistration,
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
                NameOfDirector,
                PANNumber,
                DirectorPANNumber,
                ContactNumberOfDirector,
                DirectorEmail,
                AadharNumber,
                GSTUrl,
                AddressDocUrl,
                RegCertificateUrl,
                FinancialStUrl,
                NOCextUrl,
                TwoYearBankStUrl,
                TwoyearTTRUrl,
                otherUrl,
                AadharDocUrl,
                conDetailDirUrl,
                KYCDocUrl,
                ParriPassuUrl,
                escrowAccountName,
                escrowBranch,
                escrowIFSCcode,
                escrowNameOfTheBank,
                escrowAccountNumber,
                GSTNumber,
                contactPerson,
                name,
                email,
            } = req.body;

            const updateHos = await this.userModel.findOne({ _id: userDetails._id });

            if (!updateHos) {
                return {
                    data: {
                        success: false,
                        message: "Invalid Id!",
                    }
                };
            }
            let data: any = {};
            if (name) {
                data.name = name;
            }
            if (email) {
                data.email = email;
            }
            if (GSTNumber) {
                data.GSTNumber = GSTNumber;
            }
            if (contactPerson) {
                data.contactPerson = contactPerson;
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
            if (AverageTicketSizeOfTheClaims) {
                data.AverageTicketSizeOfTheClaims = AverageTicketSizeOfTheClaims;
            }
            if (NoOfTPAsAssociated) {
                data.NoOfTPAsAssociated = NoOfTPAsAssociated;
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
            if (AadharNumber) {
                data.AadharNumber = AadharNumber;
            }
            if (PANNumber) {
                data.PANNumber = PANNumber;
            }
            if (DirectorPANNumber) {
                data.DirectorPANNumber = DirectorPANNumber;
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

            const PANNumbers = await this.userModel.find({ PANNumber: PANNumber });

            for (var doc of PANNumbers) {
                if (doc._id === userDetails._id) {
                    return {
                        data: {
                            message: " PAN Number already exist",
                        }
                    };
                }
            }
            const accountNumbers = await this.userModel.find({
                AccountNumber: AccountNumber,
            });
            for (var doc of accountNumbers) {
                if (doc._id === userDetails._id) {
                    return {
                        data: {
                            message: " PAN Number already exist",
                        }
                    };
                }
            }
            var Rep = 0;
            var UTL = 0;
            if (updateHos.Repayment != undefined) {
                Rep = updateHos.Repayment;
            }
            if (updateHos.UtilizedAmount != undefined) {
                UTL = updateHos.UtilizedAmount;
            }
            if (ExistingCreditLimit != undefined) {
                data.AvailableLimit = ExistingCreditLimit - UTL + Rep;
            }
            const updateList = await this.userModel.updateOne(
                { _id: userDetails._id },
                { $set: data },
                { useFindAndModify: false }
            );
            return {
                data: {
                    success: true,
                    message: "Hospital Updated Successfully",
                    updateHos,
                }
            };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async getAllInvoicesToHospital(IFilterDTO: IFilterDTO, currentUser: IUser): Promise<{ data: any }> {
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
            searchFilters.push({ hospitalId: currentUser._id });
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
    public async invoiceUpload(req: Request, res: Response, currentUser: IUser): Promise<{ data: any }> {
        try {
            var { claimSubmissionDate, dateOfDischarge, dateOfAdmission } = req.body;

            const { nameOfHospital, TPAName, insurerAprovedAmount, InsuranceCompanyName, claimId, nameOfInsurer, finalBillNumber, nameOfTPA, policyNumber, hospitalId, TPAId, InsuranceCompanyId,
                invoiceId, invoiceDocumentUrl, insuranceApprovalLetter, claimAmount, aggregatorId, Description,
            } = req.body;

            const userDetails = currentUser;

            if (!userDetails) {
                return {
                    data: {
                        success: false,
                        message: "user not found"
                    }
                }
            }

            // if (userDetails.LStatus === undefined || userDetails.LStatus != 'Approved' || userDetails.LStatus == 'Rejected') {
            //     return {
            //         data: {
            //             success: false,
            //             message: ' you are not Apporved By Lender'
            //         }
            //     }
            // }

            const claimIdData = await this.Invoice.findOne({ claimId: claimId })
            if (claimIdData) {
                return {
                    data: {
                        success: false,
                        message: 'claimId Already Exists '
                    }
                };
            }

            if (claimAmount >= userDetails.AvailableLimit) {
                return {
                    data: {
                        success: false,
                        message: 'You have not sufficience Balance, cross avaliable limit'
                    }
                };
            }

            // const alldata = await ltvModel.findOne({ hospialID: hospitalId });
            var LTVbyHos = userDetails.LTV;
            // if (!alldata) {
            //     return {
            //         data: {
            //             message: 'Data(Ltv) is null,please select this  Data from admin'
            //         }
            //     }
            // }

            var disallowancePercent = 0
            disallowancePercent = (100 - ((insurerAprovedAmount / claimAmount) * 100))
            const ltvToApprov = 90 - disallowancePercent
            const Ltvper = Math.round(ltvToApprov)
            const Ltvpercent = Math.round(Ltvper / 5) * 5
            if (Ltvpercent && LTVbyHos) {
                if (Ltvpercent > LTVbyHos) {
                    var LTV = LTVbyHos
                } else {
                    LTV = Ltvpercent
                }
            }

            var LTVAmount = ((insurerAprovedAmount * LTV) / 100);




            const LenderLTV = userDetails.LenderLTV;
            const LenderTenure = userDetails.LenderTenure;
            const LenderROI = userDetails.LenderROI;
            var LenderApprovalAmount = ((insurerAprovedAmount * LenderLTV) / 100);

            var date1 = new Date(claimSubmissionDate);
            var finalDate1 = new Date(date1.setDate(date1.getDate() + 1));
            claimSubmissionDate = new Date(finalDate1);

            var date2 = new Date(dateOfDischarge);
            var finalDate2 = new Date(date2.setDate(date2.getDate() + 1));
            dateOfDischarge = new Date(finalDate2);

            var date3 = new Date(dateOfAdmission);
            var finalDate3 = new Date(date3.setDate(date3.getDate() + 1));
            dateOfAdmission = new Date(finalDate3);


            const usrObj = {
                nameOfHospital: userDetails.name, TPAName, insurerAprovedAmount, InsuranceCompanyName, claimId, LTV, LTVAmount, nameOfInsurer, finalBillNumber, nameOfTPA, policyNumber,
                dateOfAdmission, claimSubmissionDate, claimAmount, aggregatorId: userDetails.aggregatorId, hospitalId: userDetails._id, LenderId: userDetails.LenderId, //validatorId: userDetails.validatorId,
                dateOfDischarge, invoiceDocumentUrl, invoiceId, Status: 'DApproved', insuranceApprovalLetter, Description, LenderLTV, LenderTenure, LenderROI, LenderApprovalAmount
            }

            const newData = new this.Invoice(usrObj);
            const Invoicedata = await newData.save();
            return { data: { success: true, data: Invoicedata } }

        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
}