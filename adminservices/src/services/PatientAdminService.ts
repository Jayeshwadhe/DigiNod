import { Service, Inject } from 'typedi';
import { Request } from 'express';

const Users = require('../models/PatientUser');

const patientloanModel = require("../models/PatientDashboard");

@Service()
export default class PatientAdminService {
    constructor(
        @Inject('PatientAdminDashboard') private PatientAdminDashboardModel: Models.PatientAdminDashboardModel,
        @Inject('patientLoanModel') private patientLoanModel: Models.patientLoanModel,
        @Inject('logger') private logger,){}

        public async getPatientDash(req: Request): Promise<{ data: any }> {
            try{
              const dashRecord = await this.PatientAdminDashboardModel.find({}).sort({ jobLastUpdatedOn: -1 }).limit(1)
              var data = dashRecord
              return { data };
          
            } catch(e){
              this.logger.error(e);
                throw e;
            }
          }

          public async patientDashboardJob(req: Request): Promise<{patientDashboardData: any}> {
            try{
                // getPatientDashboard
                var Totalinvoices = 0;
                var TotalClaimsUploaded = 0;
                var Totalpendinginvoices = 0;
                var TotalLoansInProcess = 0;
                var TotalRejectedinvoices = 0;
                var TotalRejectedLoans = 0;
                var TotalDisbursedInvoice = 0;
                var TotalDisbursedLoanamount = 0;
                var repaidLenth = 0;
    
                const Aggregatorinvoices = await Users.find({
                    $and: [{ userType: 3 }, { Role: "PatientAggregator" }],
                });
    
                if (Aggregatorinvoices) {
                    var TotalNumberOfAggregator = Aggregatorinvoices.length;
                  }
                  var countone = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "sumone": [{ $match: {} }, { $count: "total" }],
                        "sum1": [{ $match: {} }, { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } }],
                        "sumthree": [{ $match: { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] } }, { $count: "total" }],
                        "sumfour": [{ $match: { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] } }, { $count: "total" }],
                        "sumfive": [{ $match: { $and: [{ ApproveOrReject: "Undefined" }] } }, { $count: "total" }],
    
                    }
                }])
    
                if (countone[0].sumone[0] != undefined) { Totalinvoices = countone[0].sumone[0].total; } else { Totalinvoices = 0; }
                    if (countone[0].sum1[0] != undefined) { TotalClaimsUploaded = countone[0].sum1[0].total; } else { TotalClaimsUploaded = 0; }
                    if (countone[0].sumthree[0] != undefined) { TotalRejectedinvoices = countone[0].sumthree[0].total; } else { TotalRejectedinvoices = 0; }
                    if (countone[0].sumfour[0] != undefined) { TotalDisbursedInvoice = countone[0].sumfour[0].total; } else { TotalDisbursedInvoice = 0; }
                    if (countone[0].sumfive[0] != undefined) { repaidLenth = countone[0].sumfive[0].total; } else { repaidLenth = 0; }
    
                    var invoices = await this.PatientAdminDashboardModel.find({}).distinct('PartnerName');
                    var invoice = invoices.length;
                    var AverageTicketSize = TotalClaimsUploaded-Totalinvoices
    
                var resPatientDashboard = {
                    data: {
                        success: true,
                        TotalUploadedInvoices: Totalinvoices,
                        TotalUploadedInvoicesLoanAmount: TotalClaimsUploaded,
                        TotalRejectedInvoices: TotalRejectedinvoices,
                        TotalDisbursedInvoice: TotalDisbursedInvoice,
                        Aggregator: TotalNumberOfAggregator,
                        AverageTicketSize:AverageTicketSize,
                    }
                }

                // getDisbursedGraphToPatient

                var sum1 = 0; var sum2 = 0; var sum3 = 0; var sum4 = 0; var sum5 = 0; var sum6 = 0;
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
                laster1.setHours(23, 59, 59, 0)

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
                laster3.setHours(23, 59, 59, 0)

                var month4 = forcalc.getMonth() - 1;
                if (month4 <= 0) {
                    month4 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month4);
                var d = forcalc.getFullYear();
                var d1m4 = new Date(d, month4 - 1, 1);
                var laster4 = new Date(d, month4, 0);
                laster4.setHours(23, 59, 59, 0)

                var month5 = forcalc.getMonth() - 1;
                if (month5 <= 0) {
                    month5 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month5);
                var e = forcalc.getFullYear();
                var d1m5 = new Date(e, month5 - 1, 1);
                var laster5 = new Date(e, month5, 0);
                laster5.setHours(23, 59, 59, 0)

                var todaydate = new Date();

                var countser2 = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "sumone": [
                            { $match: { $and: [{ updatedAt: { $gte: this1, $lte: todaydate } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumtwo": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m1, $lte: laster1 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumthree": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m2, $lte: laster2 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumfour": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m3, $lte: laster3 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumfive": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m4, $lte: laster4 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumsix": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m5, $lte: laster5 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ]
                    }
                }])

                if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
                if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
                if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
                if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
                if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
                if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }

                var resgetDisbursedGraphToPatient = {
                    data: {
                        success: true,
                        message: [
                            [sum1, thismonth, t], 
                            [sum2, month1, a], 
                            [sum3, month2, b], 
                            [sum4, month3, c],
                            [sum5, month4, d], 
                            [sum6, month5, e]
                        ],
                    }
                }

                // getDisbursedGraphAmountToPatient

                var sum1 = 0; var sum2 = 0; var sum3 = 0; var sum4 = 0; var sum5 = 0; var sum6 = 0;
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
                laster1.setHours(23, 59, 59, 0)

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
                laster3.setHours(23, 59, 59, 0)

                var month4 = forcalc.getMonth() - 1;
                if (month4 <= 0) {
                    month4 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month4);
                var d = forcalc.getFullYear();
                var d1m4 = new Date(d, month4 - 1, 1);
                var laster4 = new Date(d, month4, 0);
                laster4.setHours(23, 59, 59, 0)

                var month5 = forcalc.getMonth() - 1;
                if (month5 <= 0) {
                    month5 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month5);
                var e = forcalc.getFullYear();
                var d1m5 = new Date(e, month5 - 1, 1);
                var laster5 = new Date(e, month5, 0);
                laster5.setHours(23, 59, 59, 0)

                var todaydate = new Date();

                var countser2 = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "sumone": [
                            { $match: { $and: [{ updatedAt: { $gte: this1, $lte: todaydate } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $count: "total" }
                        ],
                        "sumtwo": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m1, $lte: laster1 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $count: "total" }
                        ],
                        "sumthree": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m2, $lte: laster2 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $count: "total" }
                        ],
                        "sumfour": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m3, $lte: laster3 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $count: "total" }
                        ],
                        "sumfive": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m4, $lte: laster4 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $count: "total" }
                        ],
                        "sumsix": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m5, $lte: laster5 } }, { $or: [{ ApproveOrReject: "APPROVE" }, { ApproveOrReject: "Approve" }, { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" }, { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] }] } },
                            { $count: "total" }
                        ]
                    }
                }])

                if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
                if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
                if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
                if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
                if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
                if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }

                var resgetDisbursedGraphAmountToPatient = {
                    data: {
                        success: true,
                        message: [
                            [sum1, thismonth, t], [sum2, month1, a], [sum3, month2, b], [sum4, month3, c],
                            [sum5, month4, d], [sum6, month5, e]
                        ],
                    }
                }

                // getRejectedGraphToPatient
                var sum1 = 0; var sum2 = 0; var sum3 = 0; var sum4 = 0; var sum5 = 0; var sum6 = 0;
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
                laster1.setHours(23, 59, 59, 0)

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
                laster3.setHours(23, 59, 59, 0)

                var month4 = forcalc.getMonth() - 1;
                if (month4 <= 0) {
                    month4 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month4);
                var d = forcalc.getFullYear();
                var d1m4 = new Date(d, month4 - 1, 1);
                var laster4 = new Date(d, month4, 0);
                laster4.setHours(23, 59, 59, 0)

                var month5 = forcalc.getMonth() - 1;
                if (month5 <= 0) {
                    month5 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month5);
                var e = forcalc.getFullYear();
                var d1m5 = new Date(e, month5 - 1, 1);
                var laster5 = new Date(e, month5, 0);
                laster5.setHours(23, 59, 59, 0)

                var todaydate = new Date();

                var countser2 = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "sumone": [
                            { $match: { $and: [{ createdAt: { $gte: this1, $lte: todaydate } }, { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumtwo": [
                            { $match: { $and: [{ createdAt: { $gte: d1m1, $lte: laster1 } }, { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumthree": [
                            { $match: { $and: [{ createdAt: { $gte: d1m2, $lte: laster2 } }, { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumfour": [
                            { $match: { $and: [{ createdAt: { $gte: d1m3, $lte: laster3 } }, { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumfive": [
                            { $match: { $and: [{ createdAt: { $gte: d1m4, $lte: laster4 } }, { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumsix": [
                            { $match: { $and: [{ createdAt: { $gte: d1m5, $lte: laster5 } }, { $or: [{ ApproveOrReject: "REJECT" }, { ApproveOrReject: "Reject" }, { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" }, { ApproveOrReject: "False" }] }] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ]
                    }
                }])

                if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
                if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
                if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
                if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
                if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
                if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }

                var resgetRejectedGraphToPatient = {
                    data: {
                        success: true,
                        message: [
                            [sum1, thismonth, t], [sum2, month1, a], [sum3, month2, b], [sum4, month3, c],
                            [sum5, month4, d], [sum6, month5, e]
                        ],
                    }
                }

                // getInProcessGraphToPatient
                var sum1 = 0; var sum2 = 0; var sum3 = 0; var sum4 = 0; var sum5 = 0; var sum6 = 0;
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
                laster1.setHours(23, 59, 59, 0)

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
                laster3.setHours(23, 59, 59, 0)

                var month4 = forcalc.getMonth() - 1;
                if (month4 <= 0) {
                    month4 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month4);
                var d = forcalc.getFullYear();
                var d1m4 = new Date(d, month4 - 1, 1);
                var laster4 = new Date(d, month4, 0);
                laster4.setHours(23, 59, 59, 0)

                var month5 = forcalc.getMonth() - 1;
                if (month5 <= 0) {
                    month5 += 12;
                    forcalc.setFullYear(forcalc.getFullYear() - 1);
                }
                forcalc.setMonth(month5);
                var e = forcalc.getFullYear();
                var d1m5 = new Date(e, month5 - 1, 1);
                var laster5 = new Date(e, month5, 0);
                laster5.setHours(23, 59, 59, 0)

                var todaydate = new Date();

                var countser2 = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "sumone": [
                            { $match: { $and: [{ updatedAt: { $gte: this1, $lte: todaydate } },] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumtwo": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m1, $lte: laster1 } },] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumthree": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m2, $lte: laster2 } },] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumfour": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m3, $lte: laster3 } },] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumfive": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m4, $lte: laster4 } },] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ],
                        "sumsix": [
                            { $match: { $and: [{ updatedAt: { $gte: d1m5, $lte: laster5 } },] } },
                            { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } }
                        ]
                    }
                }])

                if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
                if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
                if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
                if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
                if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
                if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }

                var resgetInProcessGraphToPatient = {
                    data: {
                        success: true,
                        message: [
                            [sum1, thismonth, t], [sum2, month1, a], [sum3, month2, b], [sum4, month3, c],
                            [sum5, month4, d], [sum6, month5, e]
                        ],
                    }
                }

                
                var patientDashboardData = await this.PatientAdminDashboardModel.create({
                    resPatientDashboard: resPatientDashboard,
                    getDisbursedGraphToPatient: resgetDisbursedGraphToPatient,
                    getDisbursedGraphAmountToPatient: resgetDisbursedGraphAmountToPatient,
                    getRejectedGraphToPatient: resgetRejectedGraphToPatient,
                    getInProcessGraphToPatient: resgetInProcessGraphToPatient,
                    jobLastUpdatedOn: new Date().toUTCString()
                  });
                  return { patientDashboardData };


            } catch(e){
                this.logger.error(e);
                throw e;
            }
        }

                    // user list api for patient

                    public async getPatientUserListToAdmin(req: Request): Promise<{ resPatientUserListToAdmin: any }> {
                        try{
                            var BussMerchantDisbursedCases = 0;
                            var BussMerchantDisbursedAmount = 0;
            
            
                            var dateObj = new Date().toISOString();
                            var newdate = dateObj;
                            const countone = await this.patientLoanModel.aggregate([
                                {
                                  $facet: {
                                    Disbursedone: [
                                      {
                                        $match: {
                                          $and: [
                                            {
                                              $or: [
                                                { ApproveOrReject: "APPROVE" },
                                                { ApproveOrReject: "Approve" },
                                                { ApproveOrReject: "approve" },
                                                { ApproveOrReject: "TRUE" },
                                                { ApproveOrReject: "True" },
                                                { ApproveOrReject: "true" },
                                                { ApproveOrReject: "Ok" },
                                              ],
                                            },
                                            { UpdatedDate: newdate },
                                          ],
                                        },
                                      },
                                      { $count: "total" },
                                    ],
                                    Disbursed1: [
                                      {
                                        $match: {
                                          $and: [
                                            {
                                              $or: [
                                                { ApproveOrReject: "APPROVE" },
                                                { ApproveOrReject: "Approve" },
                                                { ApproveOrReject: "approve" },
                                                { ApproveOrReject: "TRUE" },
                                                { ApproveOrReject: "True" },
                                                { ApproveOrReject: "true" },
                                                { ApproveOrReject: "Ok" },
                                              ],
                                            },
                                            { UpdatedDate: newdate },
                                          ],
                                        },
                                      },
                                      { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                                    ],
                                  },
                                },
                              ]);
            
                              if (countone[0].Disbursedone[0] != undefined) {
                                BussMerchantDisbursedCases = countone[0].Disbursedone[0].total;
                              } else {
                                BussMerchantDisbursedCases = 0;
                              }
                              if (countone[0].Disbursed1[0] != undefined) {
                                BussMerchantDisbursedAmount = countone[0].Disbursed1[0].total;
                              } else {
                                BussMerchantDisbursedAmount = 0;
                              }
                              var Lists = [];
                              const Loans = await this.patientLoanModel.find({ valueChanged: "YES" });
                              Lists = Lists.concat(Loans);
            
                              var resPatientUserListToAdmin = {
                                  data: {
                                    success: true,
                                    Count: BussMerchantDisbursedCases,
                                    Amount: BussMerchantDisbursedAmount,
                                    message: Lists,
                                  }
                              }
                              return { resPatientUserListToAdmin };
            
                        } catch(e){
                            this.logger.error(e);
                            throw e;
                        }
                    }

}