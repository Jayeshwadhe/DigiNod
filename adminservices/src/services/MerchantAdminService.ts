import { Service, Inject } from 'typedi';
import { Request } from 'express';

const Users = require('../models/PatientUser');
// const Approvedloans = require("../models/ApprovedLoans");

@Service()
export default class MerchantAdminService {
  constructor(
    @Inject('MerchantAdminDashboard') private MerchantAdminDashboardModel: Models.MerchantAdminDashboardModel,
    @Inject('ApprovedLoans') private Approvedloans: Models.ApprovedLoansModel,
    @Inject('logger') private logger,
    @Inject('loans') private loans: Models.loansModel,
  ) {}

  public async getMerchantDash(req: Request): Promise<{ data: any }> {
    try {
      const dashRecord = await this.MerchantAdminDashboardModel.find({}).sort({ jobLastUpdatedOn: -1 }).limit(1);
      var data = dashRecord;
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async merchantDashboardJob(req: Request): Promise<{ dashboardData: any }> {
    try {
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
        $and: [{ userType: 3 }, { Role: 'Aggregator' }],
      });

      if (Aggregatorinvoices) {
        var TotalNumberOfAggregator = Aggregatorinvoices.length;
      }

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [{ $match: {} }, { $count: 'total' }],
            sum1: [{ $match: {} }, { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } }],

            sumtwo: [
              {
                $match: {
                  $or: [
                    { Status: 'NICT to work' },
                    { Status: 'LL is working' },
                    { Status: 'Not Interested' },
                    { Status: 'Yet to disburse' },
                    { Status: 'DS working' },
                  ],
                },
              },
              { $count: 'total' },
            ],
            sum2: [
              {
                $match: {
                  $or: [
                    { Status: 'NICT to work' },
                    { Status: 'LL is working' },
                    { Status: 'Not Interested' },
                    { Status: 'Yet to disburse' },
                    { Status: 'DS working' },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],

            sumthree: [
              {
                $match: {
                  $or: [
                    { Status: 'Rejected' },
                    { Status: 'Loan reversed' },
                    { Status: 'Duplicate' },
                    { Status: 'Fraud case' },
                  ],
                },
              },
              { $count: 'total' },
            ],
            sum3: [
              {
                $match: {
                  $or: [
                    { Status: 'Rejected' },
                    { Status: 'Loan reversed' },
                    { Status: 'Duplicate' },
                    { Status: 'Fraud case' },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],

            sumfour: [{ $match: { $or: [{ Status: 'Disbursed' }, { Status: "Loan closed" }] } }, { $count: 'total' }],
            sum4: [
              { $match: { $or: [{ Status: 'Disbursed' }, { Status: "Loan closed" }] } },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
          },
        },
      ]);

      if (countone[0].sumone[0] != undefined) {
        Totalinvoices = countone[0].sumone[0].total;
      } else {
        Totalinvoices = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        TotalClaimsUploaded = countone[0].sum1[0].total;
      } else {
        TotalClaimsUploaded = 0;
      }

      if (countone[0].sumtwo[0] != undefined) {
        Totalpendinginvoices = countone[0].sumtwo[0].total;
      } else {
        Totalpendinginvoices = 0;
      }
      if (countone[0].sum2[0] != undefined) {
        TotalLoansInProcess = countone[0].sum2[0].total;
      } else {
        TotalLoansInProcess = 0;
      }

      if (countone[0].sumthree[0] != undefined) {
        TotalRejectedinvoices = countone[0].sumthree[0].total;
      } else {
        TotalRejectedinvoices = 0;
      }
      if (countone[0].sum3[0] != undefined) {
        TotalRejectedLoans = countone[0].sum3[0].total;
      } else {
        TotalRejectedLoans = 0;
      }

      if (countone[0].sumfour[0] != undefined) {
        TotalDisbursedInvoice = countone[0].sumfour[0].total;
      } else {
        TotalDisbursedInvoice = 0;
      }
      if (countone[0].sum4[0] != undefined) {
        TotalDisbursedLoanamount = countone[0].sum4[0].total;
      } else {
        TotalDisbursedLoanamount = 0;
      }

      var AverageTicketSize = TotalClaimsUploaded / Totalinvoices;
      // var AverageTicketSize = TotalDisbursedLoanamount / TotalDisbursedInvoice;

      var resDashboard = {
        data: {
          success: true,
          TotalNumberOfAggregator: 1,
          TotalUploadedInvoices: Totalinvoices,
          TotalUploadedInvoicesLoanAmount: TotalClaimsUploaded,
          TotalRejectedInvoices: TotalRejectedinvoices,
          TotalRejectedInvoicesLoansAmount: TotalRejectedLoans,
          TotalDisbursedInvoice: TotalDisbursedInvoice,
          TotalDisbursedLoanamount: TotalDisbursedLoanamount,
          AverageTicketSize: Math.round(AverageTicketSize),
          LoanInProcess: Totalpendinginvoices,
          LoanInProcessAmount: TotalLoansInProcess,
        },
      };

      // disbursedGraph

      var sum1 = 0;
      var sum2 = 0;
      var sum3 = 0;
      var sum4 = 0;
      var sum5 = 0;
      var sum6 = 0;
      var forcalc = new Date();
      var thismonth = forcalc.getMonth() + 1;
      var t = forcalc.getFullYear();
      var this1 = new Date(t, thismonth - 1, 1);

      this1 = new Date(this1.getTime() + this1.getTimezoneOffset() * 60000);

      var month1 = forcalc.getMonth();
      if (month1 <= 0) {
        month1 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month1);
      var a = forcalc.getFullYear();
      var d1m1 = new Date(a, month1 - 1, 1);
      d1m1 = new Date(d1m1.getTime() + d1m1.getTimezoneOffset() * 60000);
      var laster1 = new Date(a, month1, 0);
      laster1.setHours(23, 59, 59, 0);

      laster1 = new Date(
        laster1.getTime() + laster1.getTimezoneOffset() * 60000
      );

      var month2 = forcalc.getMonth() - 1;
      if (month2 <= 0) {
        month2 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month2);
      var b = forcalc.getFullYear();
      var d1m2 = new Date(b, month2 - 1, 1);
      d1m2 = new Date(d1m2.getTime() + d1m2.getTimezoneOffset() * 60000);

      var laster2 = new Date(b, month2, 0);
      laster2.setHours(23, 59, 59, 0);

      laster2 = new Date(
        laster2.getTime() + laster2.getTimezoneOffset() * 60000
      );

      var month3 = forcalc.getMonth() - 1;
      if (month3 <= 0) {
        month3 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month3);
      var c = forcalc.getFullYear();
      var d1m3 = new Date(c, month3 - 1, 1);
      d1m3 = new Date(d1m3.getTime() + d1m3.getTimezoneOffset() * 60000);

      var laster3 = new Date(c, month3, 0);
      laster3.setHours(23, 59, 59, 0);

      laster3 = new Date(
        laster3.getTime() + laster3.getTimezoneOffset() * 60000
      );

      var month4 = forcalc.getMonth() - 1;
      if (month4 <= 0) {
        month4 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month4);
      var d = forcalc.getFullYear();
      var d1m4 = new Date(d, month4 - 1, 1);
      d1m4 = new Date(d1m4.getTime() + d1m4.getTimezoneOffset() * 60000);

      var laster4 = new Date(d, month4, 0);
      laster4.setHours(23, 59, 59, 0);

      laster4 = new Date(
        laster4.getTime() + laster4.getTimezoneOffset() * 60000
      );

      var month5 = forcalc.getMonth() - 1;
      if (month5 <= 0) {
        month5 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month5);
      var e = forcalc.getFullYear();
      var d1m5 = new Date(e, month5 - 1, 1);
      d1m5 = new Date(d1m5.getTime() + d1m5.getTimezoneOffset() * 60000);

      var laster5 = new Date(e, month5, 0);
      laster5.setHours(23, 59, 59, 0);

      laster5 = new Date(
        laster5.getTime() + laster5.getTimezoneOffset() * 60000
      );

      var todaydate = new Date();
      todaydate = new Date(
        todaydate.getTime() + todaydate.getTimezoneOffset() * 60000
      );

      var countser2 = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumtwo: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumthree: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumfour: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumfive: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumsix: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
          },
        },
      ]);

      if (countser2[0].sumone[0] != undefined) {
        sum1 = countser2[0].sumone[0].total;
      } else {
        sum1 = 0;
      }
      if (countser2[0].sumtwo[0] != undefined) {
        sum2 = countser2[0].sumtwo[0].total;
      } else {
        sum2 = 0;
      }
      if (countser2[0].sumthree[0] != undefined) {
        sum3 = countser2[0].sumthree[0].total;
      } else {
        sum3 = 0;
      }
      if (countser2[0].sumfour[0] != undefined) {
        sum4 = countser2[0].sumfour[0].total;
      } else {
        sum4 = 0;
      }
      if (countser2[0].sumfive[0] != undefined) {
        sum5 = countser2[0].sumfive[0].total;
      } else {
        sum5 = 0;
      }
      if (countser2[0].sumsix[0] != undefined) {
        sum6 = countser2[0].sumsix[0].total;
      } else {
        sum6 = 0;
      }

      var disbursedGraphRes = {
        data: {
          success: true,
          message: [
            [sum1, thismonth, t],
            [sum2, month1, a],
            [sum3, month2, b],
            [sum4, month3, c],
            [sum5, month4, d],
            [sum6, month5, e],
          ],
        },
      };

      // resDisbursedGraphAmountToMerchant

      var sum1 = 0;
      var sum2 = 0;
      var sum3 = 0;
      var sum4 = 0;
      var sum5 = 0;
      var sum6 = 0;
      var forcalc = new Date();
      var thismonth = forcalc.getMonth() + 1;
      var t = forcalc.getFullYear();
      var this1 = new Date(t, thismonth - 1, 1);
      this1 = new Date(this1.getTime() + this1.getTimezoneOffset() * 60000);

      var month1 = forcalc.getMonth();
      if (month1 <= 0) {
        month1 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month1);
      var a = forcalc.getFullYear();
      var d1m1 = new Date(a, month1 - 1, 1);
      d1m1 = new Date(d1m1.getTime() + d1m1.getTimezoneOffset() * 60000);

      var laster1 = new Date(a, month1, 0);
      laster1.setHours(23, 59, 59, 0);

      laster1 = new Date(
        laster1.getTime() + laster1.getTimezoneOffset() * 60000
      );

      var month2 = forcalc.getMonth() - 1;
      if (month2 <= 0) {
        month2 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month2);
      var b = forcalc.getFullYear();
      var d1m2 = new Date(b, month2 - 1, 1);
      d1m2 = new Date(d1m2.getTime() + d1m2.getTimezoneOffset() * 60000);

      var laster2 = new Date(b, month2, 0);
      laster2.setHours(23, 59, 59, 0);

      laster2 = new Date(
        laster2.getTime() + laster2.getTimezoneOffset() * 60000
      );

      var month3 = forcalc.getMonth() - 1;
      if (month3 <= 0) {
        month3 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month3);
      var c = forcalc.getFullYear();
      var d1m3 = new Date(c, month3 - 1, 1);
      d1m3 = new Date(d1m3.getTime() + d1m3.getTimezoneOffset() * 60000);

      var laster3 = new Date(c, month3, 0);
      laster3.setHours(23, 59, 59, 0);

      laster3 = new Date(
        laster3.getTime() + laster3.getTimezoneOffset() * 60000
      );

      var month4 = forcalc.getMonth() - 1;
      if (month4 <= 0) {
        month4 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month4);
      var d = forcalc.getFullYear();
      var d1m4 = new Date(d, month4 - 1, 1);
      d1m4 = new Date(d1m4.getTime() + d1m4.getTimezoneOffset() * 60000);

      var laster4 = new Date(d, month4, 0);
      laster4.setHours(23, 59, 59, 0);

      laster4 = new Date(
        laster4.getTime() + laster4.getTimezoneOffset() * 60000
      );

      var month5 = forcalc.getMonth() - 1;
      if (month5 <= 0) {
        month5 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month5);
      var e = forcalc.getFullYear();
      var d1m5 = new Date(e, month5 - 1, 1);
      d1m5 = new Date(d1m5.getTime() + d1m5.getTimezoneOffset() * 60000);

      var laster5 = new Date(e, month5, 0);
      laster5.setHours(23, 59, 59, 0);

      laster5 = new Date(
        laster5.getTime() + laster5.getTimezoneOffset() * 60000
      );

      var todaydate = new Date();

      todaydate = new Date(
        todaydate.getTime() + todaydate.getTimezoneOffset() * 60000
      );

      var countser2 = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $count: 'total' },
            ],
            sumtwo: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $count: 'total' },
            ],
            sumthree: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $count: 'total' },
            ],
            sumfour: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $count: 'total' },
            ],
            sumfive: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $count: 'total' },
            ],
            sumsix: [
              {
                $match: {
                  $and: [{ DisbursementDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: 'Disbursed' },{ Status: "Loan closed" }] }],
                },
              },
              { $count: 'total' },
            ],
          },
        },
      ]);

      if (countser2[0].sumone[0] != undefined) {
        sum1 = countser2[0].sumone[0].total;
      } else {
        sum1 = 0;
      }
      if (countser2[0].sumtwo[0] != undefined) {
        sum2 = countser2[0].sumtwo[0].total;
      } else {
        sum2 = 0;
      }
      if (countser2[0].sumthree[0] != undefined) {
        sum3 = countser2[0].sumthree[0].total;
      } else {
        sum3 = 0;
      }
      if (countser2[0].sumfour[0] != undefined) {
        sum4 = countser2[0].sumfour[0].total;
      } else {
        sum4 = 0;
      }
      if (countser2[0].sumfive[0] != undefined) {
        sum5 = countser2[0].sumfive[0].total;
      } else {
        sum5 = 0;
      }
      if (countser2[0].sumsix[0] != undefined) {
        sum6 = countser2[0].sumsix[0].total;
      } else {
        sum6 = 0;
      }

      var resDisbursedGraphAmountToMerchant = {
        data: {
          success: true,
          message: [
            [sum1, thismonth, t],
            [sum2, month1, a],
            [sum3, month2, b],
            [sum4, month3, c],
            [sum5, month4, d],
            [sum6, month5, e],
          ],
        },
      };

      // resRejectedGraphToMerchant

      var sum1 = 0;
      var sum2 = 0;
      var sum3 = 0;
      var sum4 = 0;
      var sum5 = 0;
      var sum6 = 0;
      var forcalc = new Date();
      var thismonth = forcalc.getMonth() + 1;
      var t = forcalc.getFullYear();
      var this1 = new Date(t, thismonth - 1, 1);
      this1 = new Date(this1.getTime() + this1.getTimezoneOffset() * 60000);

      var month1 = forcalc.getMonth();
      if (month1 <= 0) {
        month1 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month1);
      var a = forcalc.getFullYear();
      var d1m1 = new Date(a, month1 - 1, 1);
      d1m1 = new Date(d1m1.getTime() + d1m1.getTimezoneOffset() * 60000);

      var laster1 = new Date(a, month1, 0);
      laster1.setHours(23, 59, 59, 0);

      laster1 = new Date(
        laster1.getTime() + laster1.getTimezoneOffset() * 60000
      );

      var month2 = forcalc.getMonth() - 1;
      if (month2 <= 0) {
        month2 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month2);
      var b = forcalc.getFullYear();
      var d1m2 = new Date(b, month2 - 1, 1);
      d1m2 = new Date(d1m2.getTime() + d1m2.getTimezoneOffset() * 60000);

      var laster2 = new Date(b, month2, 0);
      laster2.setHours(23, 59, 59, 0);

      laster2 = new Date(
        laster2.getTime() + laster2.getTimezoneOffset() * 60000
      );

      var month3 = forcalc.getMonth() - 1;
      if (month3 <= 0) {
        month3 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month3);
      var c = forcalc.getFullYear();
      var d1m3 = new Date(c, month3 - 1, 1);
      d1m3 = new Date(d1m3.getTime() + d1m3.getTimezoneOffset() * 60000);

      var laster3 = new Date(c, month3, 0);
      laster3.setHours(23, 59, 59, 0);

      laster3 = new Date(
        laster3.getTime() + laster3.getTimezoneOffset() * 60000
      );

      var month4 = forcalc.getMonth() - 1;
      if (month4 <= 0) {
        month4 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month4);
      var d = forcalc.getFullYear();
      var d1m4 = new Date(d, month4 - 1, 1);
      d1m4 = new Date(d1m4.getTime() + d1m4.getTimezoneOffset() * 60000);

      var laster4 = new Date(d, month4, 0);
      laster4.setHours(23, 59, 59, 0);

      laster4 = new Date(
        laster4.getTime() + laster4.getTimezoneOffset() * 60000
      );

      var month5 = forcalc.getMonth() - 1;
      if (month5 <= 0) {
        month5 += 12;
        forcalc.setFullYear(forcalc.getFullYear() - 1);
      }
      forcalc.setMonth(month5);
      var e = forcalc.getFullYear();
      var d1m5 = new Date(e, month5 - 1, 1);
      d1m5 = new Date(d1m5.getTime() + d1m5.getTimezoneOffset() * 60000);

      var laster5 = new Date(e, month5, 0);
      laster5.setHours(23, 59, 59, 0);

      laster5 = new Date(
        laster5.getTime() + laster5.getTimezoneOffset() * 60000
      );

      var todaydate = new Date();
      todaydate = new Date(
        todaydate.getTime() + todaydate.getTimezoneOffset() * 60000
      );

      var countser2 = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [
                    { ApplicationDate: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: 'Rejected' },
                        { Status: 'Loan reversed' },
                        { Status: 'Duplicate' },
                        { Status: 'Fraud case' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumtwo: [
              {
                $match: {
                  $and: [
                    { ApplicationDate: { $gte: d1m1, $lte: laster1 } },
                    {
                      $or: [
                        { Status: 'Rejected' },
                        { Status: 'Loan reversed' },
                        { Status: 'Duplicate' },
                        { Status: 'Fraud case' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumthree: [
              {
                $match: {
                  $and: [
                    { ApplicationDate: { $gte: d1m2, $lte: laster2 } },
                    {
                      $or: [
                        { Status: 'Rejected' },
                        { Status: 'Loan reversed' },
                        { Status: 'Duplicate' },
                        { Status: 'Fraud case' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumfour: [
              {
                $match: {
                  $and: [
                    { ApplicationDate: { $gte: d1m3, $lte: laster3 } },
                    {
                      $or: [
                        { Status: 'Rejected' },
                        { Status: 'Loan reversed' },
                        { Status: 'Duplicate' },
                        { Status: 'Fraud case' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumfive: [
              {
                $match: {
                  $and: [
                    { ApplicationDate: { $gte: d1m4, $lte: laster4 } },
                    {
                      $or: [
                        { Status: 'Rejected' },
                        { Status: 'Loan reversed' },
                        { Status: 'Duplicate' },
                        { Status: 'Fraud case' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumsix: [
              {
                $match: {
                  $and: [
                    { ApplicationDate: { $gte: d1m5, $lte: laster5 } },
                    {
                      $or: [
                        { Status: 'Rejected' },
                        { Status: 'Loan reversed' },
                        { Status: 'Duplicate' },
                        { Status: 'Fraud case' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
          },
        },
      ]);

      if (countser2[0].sumone[0] != undefined) {
        sum1 = countser2[0].sumone[0].total;
      } else {
        sum1 = 0;
      }
      if (countser2[0].sumtwo[0] != undefined) {
        sum2 = countser2[0].sumtwo[0].total;
      } else {
        sum2 = 0;
      }
      if (countser2[0].sumthree[0] != undefined) {
        sum3 = countser2[0].sumthree[0].total;
      } else {
        sum3 = 0;
      }
      if (countser2[0].sumfour[0] != undefined) {
        sum4 = countser2[0].sumfour[0].total;
      } else {
        sum4 = 0;
      }
      if (countser2[0].sumfive[0] != undefined) {
        sum5 = countser2[0].sumfive[0].total;
      } else {
        sum5 = 0;
      }
      if (countser2[0].sumsix[0] != undefined) {
        sum6 = countser2[0].sumsix[0].total;
      } else {
        sum6 = 0;
      }

      var resRejectedGraphToMerchant = {
        data: {
          success: true,
          message: [
            [sum1, thismonth, t],
            [sum2, month1, a],
            [sum3, month2, b],
            [sum4, month3, c],
            [sum5, month4, d],
            [sum6, month5, e],
          ],
        },
      };

      // resInProcessGraphToMerchant

      var sum1 = 0;
      var sum2 = 0;
      var sum3 = 0;
      var sum4 = 0;
      var sum5 = 0;
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

      var countser2 = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: 'NICT to work on' },
                        { ActionNeeded: 'LL is working' },
                        { ActionNeeded: 'Not Interested' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumtwo: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: d1m1, $lte: laster1 } },
                    {
                      $or: [
                        { ActionNeeded: 'NICT to work on' },
                        { ActionNeeded: 'LL is working' },
                        { ActionNeeded: 'Not Interested' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumthree: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: d1m2, $lte: laster2 } },
                    {
                      $or: [
                        { ActionNeeded: 'NICT to work on' },
                        { ActionNeeded: 'LL is working' },
                        { ActionNeeded: 'Not Interested' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumfour: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: d1m3, $lte: laster3 } },
                    {
                      $or: [
                        { ActionNeeded: 'NICT to work on' },
                        { ActionNeeded: 'LL is working' },
                        { ActionNeeded: 'Not Interested' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumfive: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: d1m4, $lte: laster4 } },
                    {
                      $or: [
                        { ActionNeeded: 'NICT to work on' },
                        { ActionNeeded: 'LL is working' },
                        { ActionNeeded: 'Not Interested' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
            sumsix: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: d1m5, $lte: laster5 } },
                    {
                      $or: [
                        { ActionNeeded: 'NICT to work on' },
                        { ActionNeeded: 'LL is working' },
                        { ActionNeeded: 'Not Interested' },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: '$_v', total: { $sum: '$LoanAmount' } } },
            ],
          },
        },
      ]);

      if (countser2[0].sumone[0] != undefined) {
        sum1 = countser2[0].sumone[0].total;
      } else {
        sum1 = 0;
      }
      if (countser2[0].sumtwo[0] != undefined) {
        sum2 = countser2[0].sumtwo[0].total;
      } else {
        sum2 = 0;
      }
      if (countser2[0].sumthree[0] != undefined) {
        sum3 = countser2[0].sumthree[0].total;
      } else {
        sum3 = 0;
      }
      if (countser2[0].sumfour[0] != undefined) {
        sum4 = countser2[0].sumfour[0].total;
      } else {
        sum4 = 0;
      }
      if (countser2[0].sumfive[0] != undefined) {
        sum5 = countser2[0].sumfive[0].total;
      } else {
        sum5 = 0;
      }
      if (countser2[0].sumsix[0] != undefined) {
        sum6 = countser2[0].sumsix[0].total;
      } else {
        sum6 = 0;
      }

      var resInProcessGraphToMerchant = {
        data: {
          success: true,
          message: [
            [sum1, thismonth, t],
            [sum2, month1, a],
            [sum3, month2, b],
            [sum4, month3, c],
            [sum5, month4, d],
            [sum6, month5, e],
          ],
        },
      };

      var dashboardData = await this.MerchantAdminDashboardModel.create({
        resDashboard: resDashboard,
        disbursedGraphRes: disbursedGraphRes,
        resDisbursedGraphAmountToMerchant: resDisbursedGraphAmountToMerchant,
        resRejectedGraphToMerchant: resRejectedGraphToMerchant,
        resInProcessGraphToMerchant: resInProcessGraphToMerchant,
        jobLastUpdatedOn: new Date().toUTCString(),
      });
      return { dashboardData };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async updateException(req: Request): Promise<{ exceptionalData: any }> {
    let { KOCode } = req.query;
    let IsUser: any = await this.loans.findOne({ KOCode: KOCode });
    let exceptionalData: any = {};

    if (IsUser) {
      if (IsUser.IsException) {
        exceptionalData.User = IsUser;
        exceptionalData.success = false;
        exceptionalData.message = 'This user already has Exceptional';

        return { exceptionalData };
      } else {
        let updatedUser = await this.loans.updateOne(
          { KOCode: KOCode },

          { $set: { IsException: true } },
        );
        if (updatedUser.ok == 1) {
          IsUser = await this.loans.findOne({ KOCode: KOCode });
          exceptionalData.User = IsUser;
          exceptionalData.success = true;
          exceptionalData.message = 'Exceptional Applyed to the Customer';
        } else {
          exceptionalData.success = false;
          exceptionalData.message = 'Unable to Update';
          return { exceptionalData };
        }
      }
    } else {
      exceptionalData.success = false;
      exceptionalData.message = 'Unable to Find Customer';
    }
    return { exceptionalData };
  }
}
