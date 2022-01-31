import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
@Service()
export default class supplierAdminService {
  constructor(
    @Inject('SupplierAdminDashboard') private SupplierAdminDashboardModel: Models.SupplierAdminDashboardModel,
    @Inject('SupplierInvoice') private SupplierInvoiceModel: Models.SupplierInvoiceModel,
    @Inject('SupplierUser') private SupplierUserModel: Models.SupplierUserModel,
    @Inject('logger') private logger,
  ) {
  }

  public async getSDash(req: Request): Promise<{ data: any }> {
    try {
      const userRecord = await this.SupplierAdminDashboardModel.find({}).sort({ jobLastUpdatedOn: -1 }).limit(1)
      var data = userRecord
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async supplierDashboardJob(req: Request): Promise<{ dashboardData: any }> {
    try {
      const TotalVendor = await this.SupplierUserModel.aggregate([{
        $facet: {
          "vendorCount": [{ $match: { Role: "Vendor" } }, { $count: "total" }],
          "sanctionSum": [
            { $match: { Role: "Vendor" } },
            { $group: { _id: "$_v", total: { $sum: "$SanctionLimit" } } }
          ],
          "utilizedSum": [
            { $match: { Role: "Vendor" } },
            { $group: { _id: "$_v", total: { $sum: "$UtilizedAmount" } } }
          ],
          "availableSum": [
            { $match: { Role: "Vendor" } },
            { $group: { _id: "$_v", total: { $sum: "$AvailableLimit" } } }
          ],
          "repaymentSum": [
            { $match: { Role: "Vendor" } },
            { $group: { _id: "$_v", total: { $sum: "$Repayment" } } }
          ],
        }
      }]);
      const TotLender = await this.SupplierUserModel.find({ Role: "Lender" });
      const TotHosp = await this.SupplierUserModel.find({ Role: "Hospital" });

      var TotalSanctionLimit = 0;
      var TotalUtilizedLimit = 0;
      var TotalAvailableLimit = 0;
      var TotalRepaymentsLimit = 0;
      var TotalInvoicesAmount = 0;
      var TotalfundedPaidAmount = 0;
      var TotalPendingAmount = 0;
      var TotalRejectedAmount = 0;
      var AllVendor;
      var TotRepaymentCount = 0;
      if (TotalVendor[0].vendorCount[0] != undefined) { AllVendor = TotalVendor[0].vendorCount[0].total; } else { AllVendor = 0; }
      if (TotalVendor[0].sanctionSum[0] != undefined) { TotalSanctionLimit = TotalVendor[0].sanctionSum[0].total; } else { TotalSanctionLimit = 0; }
      if (TotalVendor[0].utilizedSum[0] != undefined) { TotalUtilizedLimit = TotalVendor[0].utilizedSum[0].total; } else { TotalUtilizedLimit = 0; }
      if (TotalVendor[0].availableSum[0] != undefined) { TotalAvailableLimit = TotalVendor[0].availableSum[0].total; } else { TotalAvailableLimit = 0; }
      if (TotalVendor[0].repaymentSum[0] != undefined) { TotalRepaymentsLimit = TotalVendor[0].repaymentSum[0].total; } else { TotalRepaymentsLimit = 0; }

      var Totalinvoices; var Totalfunded; var Totalpending; var Totalrejected;
      const everyData = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "repayCount": [{ $match: { Status: "Repaid" } }, { $count: "total" }],
          "invoicedataSum": [
            { $match: {} },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "invoicedataCount": [{ $match: {} }, { $count: "total" }],
          "fundedSum": [
            {
              $match: {
                $or: [{ Status: 'Funded' }//, { Status: 'Repaid' }, { Status: 'HRepaid' }
                ]
              }
            }, { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "fundedCount": [{
            $match: {
              $or: [{ Status: 'Funded' }//, { Status: 'Repaid' }, { Status: 'HRepaid' }
              ]
            }
          }, { $count: "total" }],
          "pendingSum": [
            { $match: { $or: [{ Status: 'Pending' }, { Status: 'HApproved' }, { Status: 'LApproved' }] } },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "pendingCount": [{ $match: { $or: [{ Status: 'Pending' }, { Status: 'HApproved' }, { Status: 'LApproved' }] } }, { $count: "total" }],
          "rejectedSum": [
            { $match: { $or: [{ Status: 'HRejected' }, { Status: 'LRejected' }] } },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "rejectedCount": [{ $match: { $or: [{ Status: 'HRejected' }, { Status: 'LRejected' }] } }, { $count: "total" }],
        }
      }])

      if (everyData[0].repayCount[0] != undefined) { TotRepaymentCount = everyData[0].repayCount[0].total; } else { TotRepaymentCount = 0; }
      if (everyData[0].invoicedataSum[0] != undefined) { TotalInvoicesAmount = everyData[0].invoicedataSum[0].total; } else { TotalInvoicesAmount = 0; }
      if (everyData[0].invoicedataCount[0] != undefined) { Totalinvoices = everyData[0].invoicedataCount[0].total; } else { Totalinvoices = 0; }
      if (everyData[0].fundedSum[0] != undefined) { TotalfundedPaidAmount = everyData[0].fundedSum[0].total; } else { TotalfundedPaidAmount = 0; }
      if (everyData[0].fundedCount[0] != undefined) { Totalfunded = everyData[0].fundedCount[0].total; } else { Totalfunded = 0; }
      if (everyData[0].pendingSum[0] != undefined) { TotalPendingAmount = everyData[0].pendingSum[0].total; } else { TotalPendingAmount = 0; }
      if (everyData[0].pendingCount[0] != undefined) { Totalpending = everyData[0].pendingCount[0].total; } else { Totalpending = 0; }
      if (everyData[0].rejectedSum[0] != undefined) { TotalRejectedAmount = everyData[0].rejectedSum[0].total; } else { TotalRejectedAmount = 0; }
      if (everyData[0].rejectedCount[0] != undefined) { Totalrejected = everyData[0].rejectedCount[0].total; } else { Totalrejected = 0; }

      //funded invoice graph

      var sum1 = 0; var sum2 = 0; var sum3 = 0;
      var sum4 = 0; var sum5 = 0; var sum6 = 0;
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

      var countser2 = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "sumone": [
            { $match: { InvoiceDate: { $gte: this1, $lte: todaydate } }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumtwo": [
            { $match: { InvoiceDate: { $gte: d1m1, $lte: laster1 } }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumthree": [
            { $match: { InvoiceDate: { $gte: d1m2, $lte: laster2 } }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumfour": [
            { $match: { InvoiceDate: { $gte: d1m3, $lte: laster3 } }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumfive": [
            { $match: { InvoiceDate: { $gte: d1m4, $lte: laster4 } }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumsix": [
            { $match: { InvoiceDate: { $gte: d1m5, $lte: laster5 } }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ]
        }
      }])

      if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
      if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
      if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
      if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
      if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
      if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }

      var getFundedInvoiceGraphToAdmin = [[sum1, thismonth, t], [sum2, month1, a], [sum3, month2, b], [sum4, month3, c],
      [sum5, month4, d], [sum6, month5, e]];

      //getLApprovedInvoiceGraphToAdmin

      var sum1 = 0; var sum2 = 0; var sum3 = 0;
      var sum4 = 0; var sum5 = 0; var sum6 = 0;
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

      var countser2 = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "sumone": [
            { $match: { $and: [{ InvoiceDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumtwo": [
            { $match: { $and: [{ InvoiceDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumthree": [
            { $match: { $and: [{ InvoiceDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumfour": [
            { $match: { $and: [{ InvoiceDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumfive": [
            { $match: { $and: [{ InvoiceDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ],
          "sumsix": [
            { $match: { $and: [{ InvoiceDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: "LApproved" }, { Status: "HApproved" }, { Status: "Repaid" }, { Status: "Funded" }, { Status: "HRepaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } }
          ]
        }
      }])

      if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
      if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
      if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
      if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
      if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
      if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }


      const getLApprovedInvoiceGraphToAdmin = [[sum1, thismonth, t], [sum2, month1, a], [sum3, month2, b], [sum4, month3, c], [sum5, month4, d], [sum6, month5, e]]

      //getInvoiceGraphToAdmin

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

      var countser2 = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "sumone": [
            { $match: { $and: [{ PaymentDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
          ],
          "sumtwo": [
            { $match: { $and: [{ PaymentDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
          ],
          "sumthree": [
            { $match: { $and: [{ PaymentDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
          ],
          "sumfour": [
            { $match: { $and: [{ PaymentDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
          ],
          "sumfive": [
            { $match: { $and: [{ PaymentDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
          ],
          "sumsix": [
            { $match: { $and: [{ PaymentDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] }, },
            { $group: { _id: "$_v", total: { $sum: "$LTVAmount" } } }
          ]
        }
      }])

      if (countser2[0].sumone[0] != undefined) { sum1 = countser2[0].sumone[0].total; } else { sum1 = 0; }
      if (countser2[0].sumtwo[0] != undefined) { sum2 = countser2[0].sumtwo[0].total; } else { sum2 = 0; }
      if (countser2[0].sumthree[0] != undefined) { sum3 = countser2[0].sumthree[0].total; } else { sum3 = 0; }
      if (countser2[0].sumfour[0] != undefined) { sum4 = countser2[0].sumfour[0].total; } else { sum4 = 0; }
      if (countser2[0].sumfive[0] != undefined) { sum5 = countser2[0].sumfive[0].total; } else { sum5 = 0; }
      if (countser2[0].sumsix[0] != undefined) { sum6 = countser2[0].sumsix[0].total; } else { sum6 = 0; }


      var getInvoiceGraphToAdmin = [[sum1, thismonth, t], [sum2, month1, a], [sum3, month2, b], [sum4, month3, c], [sum5, month4, d], [sum6, month5, e]]

      //getAdminGraphOne

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
      var countone = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "sumone": [{ $match: { InvoiceDate: { $gte: this1, $lte: todaydate } } }, { $count: "total" }],
          "sumtwo": [{ $match: { InvoiceDate: { $gte: d1m1, $lte: laster1 } } }, { $count: "total" }],
          "sumthree": [{ $match: { InvoiceDate: { $gte: d1m2, $lte: laster2 } } }, { $count: "total" }],
          "sumfour": [{ $match: { InvoiceDate: { $gte: d1m3, $lte: laster3 } } }, { $count: "total" }],
          "sumfive": [{ $match: { InvoiceDate: { $gte: d1m4, $lte: laster4 } } }, { $count: "total" }],
          "sumsix": [{ $match: { InvoiceDate: { $gte: d1m5, $lte: laster5 } } }, { $count: "total" }],

          "InProsumone": [{ $match: { $and: [{ InvoiceDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
          "InProsumtwo": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
          "InProsumthree": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
          "InProsumfour": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
          "InProsumfive": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],
          "InProsumsix": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: "Pending" }, { Status: "HApproved" }, { Status: "LApproved" }] }] } }, { $count: "total" }],

          "Disbursedsumone": [{ $match: { $and: [{ InvoiceDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
          "Disbursedsumtwo": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
          "Disbursedsumthree": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
          "Disbursedsumfour": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
          "Disbursedsumfive": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] } }, { $count: "total" }],
          "Disbursedsumsix": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }] } }, { $count: "total" }],

          "Repaidsumone": [{ $match: { $and: [{ InvoiceDate: { $gte: this1, $lte: todaydate } }, { Status: "Repaid" }] } }, { $count: "total" }],
          "Repaidsumtwo": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m1, $lte: laster1 } }, { Status: "Repaid" }] } }, { $count: "total" }],
          "Repaidsumthree": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m2, $lte: laster2 } }, { Status: "Repaid" }] } }, { $count: "total" }],
          "Repaidsumfour": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m3, $lte: laster3 } }, { Status: "Repaid" }] } }, { $count: "total" }],
          "Repaidsumfive": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m4, $lte: laster4 } }, { Status: "Repaid" }] } }, { $count: "total" }],
          "Repaidsumsix": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m5, $lte: laster5 } }, { Status: "Repaid" }] } }, { $count: "total" }],

          "Rejectedsumone": [{ $match: { $and: [{ InvoiceDate: { $gte: this1, $lte: todaydate } }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
          "Rejectedsumtwo": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m1, $lte: laster1 } }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
          "Rejectedsumthree": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m2, $lte: laster2 } }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
          "Rejectedsumfour": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m3, $lte: laster3 } }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
          "Rejectedsumfive": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m4, $lte: laster4 } }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }],
          "Rejectedsumsix": [{ $match: { $and: [{ InvoiceDate: { $gte: d1m5, $lte: laster5 } }, { $or: [{ Status: "HRejected" }, { Status: "LRejected" }] }] } }, { $count: "total" }]
        }
      }])

      if (countone[0].sumone[0] != undefined) { sum1 = countone[0].sumone[0].total; } else { sum1 = 0; }
      if (countone[0].sumtwo[0] != undefined) { sum2 = countone[0].sumtwo[0].total; } else { sum2 = 0; }
      if (countone[0].sumthree[0] != undefined) { sum3 = countone[0].sumthree[0].total; } else { sum3 = 0; }
      if (countone[0].sumfour[0] != undefined) { sum4 = countone[0].sumfour[0].total; } else { sum4 = 0; }
      if (countone[0].sumfive[0] != undefined) { sum5 = countone[0].sumfive[0].total; } else { sum5 = 0; }
      if (countone[0].sumsix[0] != undefined) { sum6 = countone[0].sumsix[0].total; } else { sum6 = 0; }

      if (countone[0].InProsumone[0] != undefined) { InProcesssum1 = countone[0].InProsumone[0].total; } else { InProcesssum1 = 0; }
      if (countone[0].InProsumtwo[0] != undefined) { InProcesssum2 = countone[0].InProsumtwo[0].total; } else { InProcesssum2 = 0; }
      if (countone[0].InProsumthree[0] != undefined) { InProcesssum3 = countone[0].InProsumthree[0].total; } else { InProcesssum3 = 0; }
      if (countone[0].InProsumfour[0] != undefined) { InProcesssum4 = countone[0].InProsumfour[0].total; } else { InProcesssum4 = 0; }
      if (countone[0].InProsumfive[0] != undefined) { InProcesssum5 = countone[0].InProsumfive[0].total; } else { InProcesssum5 = 0; }
      if (countone[0].InProsumsix[0] != undefined) { InProcesssum6 = countone[0].InProsumsix[0].total; } else { InProcesssum6 = 0; }

      if (countone[0].Disbursedsumone[0] != undefined) { Disbursedsum1 = countone[0].Disbursedsumone[0].total; } else { Disbursedsum1 = 0; }
      if (countone[0].Disbursedsumtwo[0] != undefined) { Disbursedsum2 = countone[0].Disbursedsumtwo[0].total; } else { Disbursedsum2 = 0; }
      if (countone[0].Disbursedsumthree[0] != undefined) { Disbursedsum3 = countone[0].Disbursedsumthree[0].total; } else { Disbursedsum3 = 0; }
      if (countone[0].Disbursedsumfour[0] != undefined) { Disbursedsum4 = countone[0].Disbursedsumfour[0].total; } else { Disbursedsum4 = 0; }
      if (countone[0].Disbursedsumfive[0] != undefined) { Disbursedsum5 = countone[0].Disbursedsumfive[0].total; } else { Disbursedsum5 = 0; }
      if (countone[0].Disbursedsumsix[0] != undefined) { Disbursedsum6 = countone[0].Disbursedsumsix[0].total; } else { Disbursedsum6 = 0; }

      if (countone[0].Repaidsumone[0] != undefined) { Repaidsum1 = countone[0].Repaidsumone[0].total; } else { Repaidsum1 = 0; }
      if (countone[0].Repaidsumtwo[0] != undefined) { Repaidsum2 = countone[0].Repaidsumtwo[0].total; } else { Repaidsum2 = 0; }
      if (countone[0].Repaidsumthree[0] != undefined) { Repaidsum3 = countone[0].Repaidsumthree[0].total; } else { Repaidsum3 = 0; }
      if (countone[0].Repaidsumfour[0] != undefined) { Repaidsum4 = countone[0].Repaidsumfour[0].total; } else { Repaidsum4 = 0; }
      if (countone[0].Repaidsumfive[0] != undefined) { Repaidsum5 = countone[0].Repaidsumfive[0].total; } else { Repaidsum5 = 0; }
      if (countone[0].Repaidsumsix[0] != undefined) { Repaidsum6 = countone[0].Repaidsumsix[0].total; } else { Repaidsum6 = 0; }

      if (countone[0].Rejectedsumone[0] != undefined) { Rejectedsum1 = countone[0].Rejectedsumone[0].total; } else { Rejectedsum1 = 0; }
      if (countone[0].Rejectedsumtwo[0] != undefined) { Rejectedsum2 = countone[0].Rejectedsumtwo[0].total; } else { Rejectedsum2 = 0; }
      if (countone[0].Rejectedsumthree[0] != undefined) { Rejectedsum3 = countone[0].Rejectedsumthree[0].total; } else { Rejectedsum3 = 0; }
      if (countone[0].Rejectedsumfour[0] != undefined) { Rejectedsum4 = countone[0].Rejectedsumfour[0].total; } else { Rejectedsum4 = 0; }
      if (countone[0].Rejectedsumfive[0] != undefined) { Rejectedsum5 = countone[0].Rejectedsumfive[0].total; } else { Rejectedsum5 = 0; }
      if (countone[0].Rejectedsumsix[0] != undefined) { Rejectedsum6 = countone[0].Rejectedsumsix[0].total; } else { Rejectedsum6 = 0; }

      var monthsAndYears = [[thismonth, t], [month1, a], [month2, b], [month3, c], [month4, d], [month5, e]]
      var All = [sum1, sum2, sum3, sum4, sum5, sum6]
      var InProcess = [InProcesssum1, InProcesssum2, InProcesssum3, InProcesssum4, InProcesssum5, InProcesssum6]
      var Disbursed = [Disbursedsum1, Disbursedsum2, Disbursedsum3, Disbursedsum4, Disbursedsum5, Disbursedsum6]
      var Repaid = [Repaidsum1, Repaidsum2, Repaidsum3, Repaidsum4, Repaidsum5, Repaidsum6]
      var Rejected = [Rejectedsum1, Rejectedsum2, Rejectedsum3, Rejectedsum4, Rejectedsum5, Rejectedsum6]

      //getLastPieGraphForAdmin

      var FundedSum = 0;
      var UnderPaidsum = 0;
      var OverPaidsum = 0;
      var FullPaidsum = 0;
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


      var countone = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "sumone": [{
            $match: {
              $and: [{ InvoiceDate: { $gte: d1m5, $lte: todaydate } },
              { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }
              ],
            }
          }, { $count: "total" }],
          "sumtwo": [{
            $match: {
              $and: [{ InvoiceDate: { $gte: d1m5, $lte: todaydate } },
              { Status: "Repaid" }, { SettleStatus: "UnderPaid" }
              ],
            }
          }, { $count: "total" }],
          "sumthree": [{
            $match: {
              $and: [{ InvoiceDate: { $gte: d1m5, $lte: todaydate } },
              { Status: "Repaid" }, { SettleStatus: "FullPaid" }
              ],
            }
          }, { $count: "total" }],
          "sumfour": [{
            $match: {
              $and: [{ InvoiceDate: { $gte: d1m5, $lte: todaydate } },
              { Status: "Repaid" }, { SettleStatus: "OverPaid" }
              ],
            }
          }, { $count: "total" }],

        }
      }])

      if (countone[0].sumone[0] != undefined) { FundedSum = countone[0].sumone[0].total; } else { FundedSum = 0; }
      if (countone[0].sumtwo[0] != undefined) { UnderPaidsum = countone[0].sumtwo[0].total; } else { UnderPaidsum = 0; }
      if (countone[0].sumthree[0] != undefined) { FullPaidsum = countone[0].sumthree[0].total; } else { FullPaidsum = 0; }
      if (countone[0].sumfour[0] != undefined) { OverPaidsum = countone[0].sumfour[0].total; } else { OverPaidsum = 0; }


      var TotalFunded = FundedSum
      var UnderPaid = UnderPaidsum
      var OverPaid = OverPaidsum
      var FullPaid = FullPaidsum

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

      var TotalSum; var Fundedsum;
      var countone = await this.SupplierInvoiceModel.aggregate([{
        $facet: {
          "sumone": [{
            $match: { InvoiceDate: { $gte: d1m5, $lte: todaydate } }
          }, { $count: "total" }],
          "sumtwo": [{
            $match: {
              $and: [{ InvoiceDate: { $gte: d1m5, $lte: todaydate } },
              { $or: [{ Status: "Funded" }, { Status: "HRepaid" }, { Status: "Repaid" }] }
              ],
            }
          }, { $count: "total" }],

        }
      }])

      if (countone[0].sumone[0] != undefined) { TotalSum = countone[0].sumone[0].total; } else { TotalSum = 0; }
      if (countone[0].sumtwo[0] != undefined) { Fundedsum = countone[0].sumtwo[0].total; } else { Fundedsum = 0; }

      var TotalInvoices = TotalSum
      // var TotalFunded = Fundedsum

      var dashboardData = await this.SupplierAdminDashboardModel.create({
        TotalVendor: AllVendor,
        TotalLenders: TotLender.length,
        TotalHospitals: TotHosp.length,
        TotalUtilizedLimit: TotalUtilizedLimit,
        TotalRepaymentCount: TotRepaymentCount,
        TotalRepaymentsLimit: TotalRepaymentsLimit,
        TotalSanctionLimit: TotalSanctionLimit,
        TotalAvailableLimit: TotalAvailableLimit,
        TotalinvoicesCount: Totalinvoices,
        TotalInvoicesAmount: TotalInvoicesAmount,
        TotalPendingCount: Totalpending,
        TotalPendingAmount: TotalPendingAmount,
        TotalfundedCount: Totalfunded,
        TotalfundedPaidAmount: TotalfundedPaidAmount,
        TotalRejectedCount: Totalrejected,
        TotalRejectedAmount: TotalRejectedAmount,
        getFundedInvoiceGraphToAdmin: getFundedInvoiceGraphToAdmin,
        getLApprovedInvoiceGraphToAdmin: getLApprovedInvoiceGraphToAdmin,
        getInvoiceGraphToAdmin: getInvoiceGraphToAdmin,

        monthsAndYears: monthsAndYears,
        All: All,
        InProcess: InProcess,
        Disbursed: Disbursed,
        Repaid: Repaid,
        Rejected: Rejected,
        TotalFunded: TotalFunded,
        UnderPaid: UnderPaid,
        OverPaid: OverPaid,
        FullPaid: FullPaid,
        TotalInvoices: TotalInvoices,

        jobLastUpdatedOn: new Date().toUTCString()
      });
      return { dashboardData };
    }
    catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAllHospital(req: Request): Promise<{ data: any }> {
    try {
      var invoices = await this.SupplierUserModel.find({ $and: [{ userType: 2 }, { Role: 'Hospital' }] });
      if (invoices) {
        var AggregatorInvoices = invoices.length;
      }
      var data = ({ count: AggregatorInvoices, message: invoices })
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAllLenderToAdmin(req: Request): Promise<{ data: any }> {
    try {
      const invoices = await this.SupplierUserModel.find({ $and: [{ userType: 4 }, { Role: 'Lender' }] });
      if (invoices) {
        var AggregatorInvoices = invoices.length;
      }
      var data = ({ count: AggregatorInvoices, message: invoices })
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getUserByIdToAdmin(req: Request): Promise<{ data: any }> {
    try {
      const Id = req.query._id;
      const usr = await this.SupplierUserModel.findOne({ _id: Id });
      var data = usr
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
  public async getAllVendorToAdmin(req: Request): Promise<{ data: any }> {
    try {
      const invoices = await this.SupplierUserModel.find({ $and: [{ userType: 3 }, { Role: 'Vendor' }] });
      if (invoices) {
        var AggregatorInvoices = invoices.length;
      }
      var data = ({ count: AggregatorInvoices, message: invoices })
      return { data };
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
