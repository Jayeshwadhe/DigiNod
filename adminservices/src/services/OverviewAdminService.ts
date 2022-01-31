import { Service, Inject } from 'typedi';
import { Request } from 'express';

// const Loan = require("../models/Patientmerchentloan");
// const Patient = require("../models/patientloans");
// const Invoices = require("../models/SupplierInvoiceSchema");
// const SupplierUser = require("../models/supplierUser");
// const Invoice = require("../models/claimInvoiceSchema");
// const InvoiceUser = require("../models/claimUserSchema");
// const Approvedloans = require("../models/ApprovedLoans");


@Service()
export default class OverviewAdminService {
  constructor(
    @Inject('OverviewAdminDashboard') private OverviewAdminDashboardModel: Models.OverviewAdminDashboardModel,
    @Inject('loans') private Loan: Models.loansModel,
    @Inject('patientLoanModel') private patientLoanModel: Models.patientLoanModel,
    @Inject('SupplierInvoice') private Invoices: Models.SupplierInvoiceModel,
    @Inject('SupplierUser') private SupplierUser: Models.SupplierUserModel,
    @Inject('ClaimInvoice') private Invoice: Models.ClaimInvoiceModel,
    @Inject('ClaimUser') private InvoiceUser: Models.ClaimUserModel,
    @Inject('ApprovedLoans') private Approvedloans: Models.ApprovedLoansModel,
    @Inject('logger') private logger,) { }

  public async getOverviewDash(req: Request): Promise<{ data: any }> {
    try {
      const dashRecord = await this.OverviewAdminDashboardModel.find({}).sort({ jobLastUpdatedOn: -1 }).limit(1)
      var data = dashRecord
      return { data };

    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  public async OverviewDashboardJob(req: Request): Promise<{ overviewdashboard: any }> {
    try {
      //getDashboardForBussiness 
      const Aggregatorinvoices = await this.InvoiceUser.find({
        $and: [{ userType: 3 }, { Role: "Aggregator" }],
      });
      if (Aggregatorinvoices) {
        var TotalAggregatorinvoices = Aggregatorinvoices.length;
      }

      var Patientinvoices = await this.patientLoanModel.find({}).distinct("PartnerName");
      if (Patientinvoices) {
        var TotalPatientinvoices = Patientinvoices.length;
      }
      var TotalNumberOfAggregator =
        TotalAggregatorinvoices + TotalPatientinvoices;

      const Hospitalinvoices = await this.InvoiceUser.find({
        $and: [{ userType: 2 }, { Role: "Hospital" }],
      });
      if (Hospitalinvoices) {
        var TotalHospitalinvoices = Hospitalinvoices.length;
      }

      const HospitalSupplier = await this.SupplierUser.find({
        $and: [{ userType: 2 }, { Role: "Hospital" }],
      });
      if (HospitalSupplier) {
        var TotalHospitalSupplier = HospitalSupplier.length;
      }
      var TotalNumberOfHospital =
        TotalHospitalinvoices + TotalHospitalSupplier;

      var BussInvoiceRepayCases = 0;
      var BussInvoiceInProcessCases = 0;
      var BussInvoiceDisbursedCases = 0;
      var BussInvoiceRepayAmount = 0;
      var BussInvoiceInProcessAmount = 0;
      var BussInvoiceDisbursedAmount = 0;

      var BussSupplierRepayCases = 0;
      var BussSupplierInProcessCases = 0;
      var BussSupplierDisbursedCases = 0;
      var BussSupplierRepayAmount = 0;
      var BussSupplierInProcessAmount = 0;
      var BussSupplierDisbursedAmount = 0;

      var BussMerchantRepayCases = 0;
      var BussMerchantInProcessCases = 0;
      var BussMerchantDisbursedCases = 0;
      var BussMerchantRepayAmount = 0;
      var BussMerchantInProcessAmount = 0;
      var BussMerchantDisbursedAmount = 0;

      var BussPatientRepayCases = 0;
      var BussPatientInProcessCases = 0;
      var BussPatientDisbursedCases = 0;
      var BussPatientRepayAmount = 0;
      var BussPatientInProcessAmount = 0;
      var BussPatientDisbursedAmount = 0;

      var BussPatientCases = 0;
      var BussPatientRejectCases = 0;
      var BussPatientAmount = 0;
      var BussPatientRejectAmount = 0;

      var BussMerchantPendingCases = 0;
      var BussMerchantRejectCases = 0;
      var BussMerchantPendingAmount = 0;
      var BussMerchantRejectAmount = 0;

      var BussMerchantAmount = 0;
      var BussMerchantCases = 0;

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [{ $match: {} }, { $count: "total" }],
            sum1: [
              { $match: {} },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Pendingone: [
              {
                $match: {
                  $or: [
                    { Status: "NICT to work on" },
                    { Status: "LL is working" },
                    { Status: "Not Interested" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Pending1: [
              {
                $match: {
                  $or: [
                    { Status: "NICT to work on" },
                    { Status: "LL is working" },
                    { Status: "Not Interested" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Rejectone: [
              {
                $match: {
                  $or: [
                    { Status: "Rejected" },
                    { Status: "Loan reversed" },
                    { Status: "Duplicate" },
                    { Status: "Fraud case" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $or: [
                    { Status: "Rejected" },
                    { Status: "Loan reversed" },
                    { Status: "Duplicate" },
                    { Status: "Fraud case" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Disbursedone: [
              { $match: { $and: [{ Status: "Disbursed" }] } },
              { $count: "total" },
            ],
            Disbursed1: [
              { $match: { $and: [{ Status: "Disbursed" }] } },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////////////Patient ////////////
      var counttwo = await this.patientLoanModel.aggregate([
        {
          $facet: {
            sumone: [{ $match: {} }, { $count: "total" }],
            sum1: [
              { $match: {} },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            //"Repayone": [{ $match: {} }, { $count: "total" }],
            // "Repay1": [{ $match: {} }, { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } }],
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
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////supplier////////////////
      var countthree = await this.Invoices.aggregate([
        {
          $facet: {
            Repayone: [
              { $match: { $and: [{ $or: [{ Status: "Repaid" }] }] } },
              { $count: "total" },
            ],
            Repay1: [
              { $match: { $and: [{ $or: [{ Status: "Repaid" }] }] } },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Disbursedone: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
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
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
          },
        },
      ]);
      ////////////////invoice///////////////////
      var countfour = await this.Invoice.aggregate([
        {
          $facet: {
            Repayone: [
              { $match: { $and: [{ $or: [{ Status: "Repaid" }] }] } },
              { $count: "total" },
            ],
            Repay1: [
              { $match: { $and: [{ $or: [{ Status: "Repaid" }] }] } },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $or: [
                    { Status: "Pending" },
                    { Status: "Validated" },
                    { Status: "DApproved" },
                    { Status: "LApproved" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $or: [
                    { Status: "Pending" },
                    { Status: "Validated" },
                    { Status: "DApproved" },
                    { Status: "LApproved" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            Disbursedone: [
              { $match: { $and: [{ $or: [{ Status: "Funded" }] }] } },
              { $count: "total" },
            ],
            Disbursed1: [
              { $match: { $and: [{ $or: [{ Status: "Funded" }] }] } },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
          },
        },
      ]);

      /////////// Merchant///////

      if (countone[0].sumone[0] != undefined) {
        BussMerchantCases = countone[0].sumone[0].total;
      } else {
        BussMerchantCases = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        BussMerchantAmount = countone[0].sum1[0].total;
      } else {
        BussMerchantAmount = 0;
      }

      if (countone[0].Pendingone[0] != undefined) {
        BussMerchantPendingCases = countone[0].Pendingone[0].total;
      } else {
        BussMerchantPendingCases = 0;
      }
      if (countone[0].Pending1[0] != undefined) {
        BussMerchantPendingAmount = countone[0].Pending1[0].total;
      } else {
        BussMerchantPendingAmount = 0;
      }

      if (countone[0].Rejectone[0] != undefined) {
        BussMerchantRejectCases = countone[0].Rejectone[0].total;
      } else {
        BussMerchantRejectCases = 0;
      }
      if (countone[0].Reject1[0] != undefined) {
        BussMerchantRejectAmount = countone[0].Reject1[0].total;
      } else {
        BussMerchantRejectAmount = 0;
      }

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

      ///////////////////Patient //////////////

      if (counttwo[0].sumone[0] != undefined) {
        BussPatientCases = counttwo[0].sumone[0].total;
      } else {
        BussPatientCases = 0;
      }
      if (counttwo[0].sum1[0] != undefined) {
        BussPatientAmount = counttwo[0].sum1[0].total;
      } else {
        BussPatientAmount = 0;
      }

      if (counttwo[0].Rejectone[0] != undefined) {
        BussPatientRejectCases = counttwo[0].Rejectone[0].total;
      } else {
        BussPatientRejectCases = 0;
      }
      if (counttwo[0].Reject1[0] != undefined) {
        BussPatientRejectAmount = counttwo[0].Reject1[0].total;
      } else {
        BussPatientRejectAmount = 0;
      }

      if (counttwo[0].Disbursedone[0] != undefined) {
        BussPatientDisbursedCases = counttwo[0].Disbursedone[0].total;
      } else {
        BussPatientDisbursedCases = 0;
      }
      if (counttwo[0].Disbursed1[0] != undefined) {
        BussPatientDisbursedAmount = counttwo[0].Disbursed1[0].total;
      } else {
        BussPatientDisbursedAmount = 0;
      }

      /////////////////Supplier///////////
      if (countthree[0].Repayone[0] != undefined) {
        BussSupplierRepayCases = countthree[0].Repayone[0].total;
      } else {
        BussSupplierRepayCases = 0;
      }
      if (countthree[0].Repay1[0] != undefined) {
        BussSupplierRepayAmount = countthree[0].Repay1[0].total;
      } else {
        BussSupplierRepayAmount = 0;
      }

      if (countthree[0].Inprocesstwo[0] != undefined) {
        BussSupplierInProcessCases = countthree[0].Inprocesstwo[0].total;
      } else {
        BussSupplierInProcessCases = 0;
      }
      if (countthree[0].Inprocess2[0] != undefined) {
        BussSupplierInProcessAmount = countthree[0].Inprocess2[0].total;
      } else {
        BussSupplierInProcessAmount = 0;
      }

      if (countthree[0].Disbursedone[0] != undefined) {
        BussSupplierDisbursedCases = countthree[0].Disbursedone[0].total;
      } else {
        BussSupplierDisbursedCases = 0;
      }
      if (countthree[0].Disbursed1[0] != undefined) {
        BussSupplierDisbursedAmount = countthree[0].Disbursed1[0].total;
      } else {
        BussSupplierDisbursedAmount = 0;
      }

      //////////////////Invoice/////////////
      if (countfour[0].Repayone[0] != undefined) {
        BussInvoiceRepayCases = countfour[0].Repayone[0].total;
      } else {
        BussInvoiceRepayCases = 0;
      }
      if (countfour[0].Repay1[0] != undefined) {
        BussInvoiceRepayAmount = countfour[0].Repay1[0].total;
      } else {
        BussInvoiceRepayAmount = 0;
      }

      if (countfour[0].Inprocesstwo[0] != undefined) {
        BussInvoiceInProcessCases = countfour[0].Inprocesstwo[0].total;
      } else {
        BussInvoiceInProcessCases = 0;
      }
      if (countfour[0].Inprocess2[0] != undefined) {
        BussInvoiceInProcessAmount = countfour[0].Inprocess2[0].total;
      } else {
        BussInvoiceInProcessAmount = 0;
      }

      if (countfour[0].Disbursedone[0] != undefined) {
        BussInvoiceDisbursedCases = countfour[0].Disbursedone[0].total;
      } else {
        BussInvoiceDisbursedCases = 0;
      }
      if (countfour[0].Disbursed1[0] != undefined) {
        BussInvoiceDisbursedAmount = countfour[0].Disbursed1[0].total;
      } else {
        BussInvoiceDisbursedAmount = 0;
      }

      var BussPatientInProcessCases = BussPatientCases - (BussPatientRejectCases + BussPatientDisbursedCases);
      var BussPatientInProcessAmount =
        BussPatientAmount -
        (BussPatientRejectAmount + BussPatientDisbursedAmount);

      var BussRepayCases =
        BussMerchantRepayCases +
        BussPatientRepayCases +
        BussSupplierRepayCases +
        BussInvoiceRepayCases;
      var BussRepayAmount =
        BussMerchantRepayAmount +
        BussPatientRepayAmount +
        BussSupplierRepayAmount +
        BussInvoiceRepayAmount;
      var BussInProcessCases =
        BussMerchantPendingCases +
        BussPatientInProcessCases +
        BussSupplierInProcessCases +
        BussInvoiceInProcessCases;
      var BussInProcessAmount =
        BussMerchantPendingAmount +
        BussPatientInProcessAmount +
        BussSupplierInProcessAmount +
        BussInvoiceInProcessAmount;
      var BussDisbursedCases =   // working business till date 
        BussMerchantDisbursedCases +
        BussPatientDisbursedCases +
        BussSupplierDisbursedCases +
        BussInvoiceDisbursedCases;
      var BussDisbursedAmount =
        BussMerchantDisbursedAmount +
        BussPatientDisbursedAmount +
        BussSupplierDisbursedAmount +
        BussInvoiceDisbursedAmount;

      var resgetOverviewDashboard = {
        data: {
          success: true,
          BussTotalRepayCases: BussRepayCases,
          BussTotalRepayAmount: BussRepayAmount,
          BussTotalInProcessCases: BussInProcessCases,
          BussTotalInProcessAmount: BussInProcessAmount,
          BussTotalDisbursedCases: BussDisbursedCases, //*
          BussTotalDisbursedAmount: BussDisbursedAmount,
          TotalNumberOfAggregator: TotalNumberOfAggregator,
          TotalNumberOfHospital: TotalNumberOfHospital,

        }

      }



      // getDashboardForBussinessProductWise

      var BussProWiseInvoiceCases = 0;
      var BussProWiseInvoiceInProcessCases = 0;
      var BussProWiseInvoiceRejectCases = 0;
      var BussProWiseInvoiceAmount = 0;
      var BussProWiseInvoiceInProcessAmount = 0;
      var BussProWiseInvoiceRejectAmount = 0;

      var BussProWiseSupplierCases = 0;
      var BussProWiseSupplierInProcessCases = 0;
      var BussProWiseSupplierRejectCases = 0;
      var BussProWiseSupplierAmount = 0;
      var BussProWiseSupplierInProcessAmount = 0;
      var BussProWiseSupplierRejectAmount = 0;

      var BussProWiseMerchantCases = 0;
      var BussProWiseMerchantInProcessCases = 0;
      var BussProWiseMerchantRejectCases = 0;
      var BussProWiseMerchantAmount = 0;
      var BussProWiseMerchantInProcessAmount = 0;
      var BussProWiseMerchantRejectAmount = 0;

      var BussProWisePatientCases = 0;
      var BussProWisePatientInProcessCases = 0;
      var BussProWisePatientRejectCases = 0;
      var BussProWisePatientAmount = 0;
      var BussProWisePatientInProcessAmount = 0;
      var BussProWisePatientRejectAmount = 0;

      var BussProWiseMerchantDisbursedCases = 0;
      var BussProWiseMerchantDisbursedAmount = 0;
      var BussProWiseMerchantPendingCases = 0;
      var BussProWisePatientDisbursedCases = 0;
      var BussProWisePatientDisbursedAmount = 0;
      var BussProWiseMerchantPendingAmount = 0;

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              { $match: { $or: [{ Status: "Disbursed" }] } },
              { $count: "total" },
            ],
            sum1: [
              { $match: { $or: [{ Status: "Disbursed" }] } },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Pendingone: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "NICT to work on" },
                    { ActionNeeded: "LL is working" },
                    { ActionNeeded: "Not Interested" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Pending1: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "NICT to work on" },
                    { ActionNeeded: "LL is working" },
                    { ActionNeeded: "Not Interested" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Rejectone: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "Rejected" },
                    { ActionNeeded: "Loan reversed" },
                    { ActionNeeded: "Duplicate" },
                    { ActionNeeded: "Fraud case" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "Rejected" },
                    { ActionNeeded: "Loan reversed" },
                    { ActionNeeded: "Duplicate" },
                    { ActionNeeded: "Fraud case" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Disbursedone: [
              { $match: { $or: [{ ActionNeeded: "Disbursed" }] } },
              { $count: "total" },
            ],
            Disbursed1: [
              { $match: { $or: [{ ActionNeeded: "Disbursed" }] } },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////////////Patient ////////////
      var counttwo = await this.patientLoanModel.aggregate([
        {
          $facet: {
            sumone: [{ $match: {} }, { $count: "total" }],
            sum1: [
              { $match: {} },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Inprocesstwo: [
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
                  ],
                },
              },
              { $count: "total" },
            ], /////// Disbursed
            Inprocess2: [
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
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ], /////// Disbursed
            Rejectone: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////supplier////////////////
      var countthree = await this.Invoices.aggregate([
        {
          $facet: {
            sumone: [
              { $match: { $or: [{ Status: "Funded" }] } },
              { $count: "total" },
            ],
            sum1: [
              { $match: { $or: [{ Status: "Funded" }] } },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $or: [
                    { Status: "Pending" },
                    { Status: "HApproved" },
                    { Status: "LApproved" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $or: [
                    { Status: "Pending" },
                    { Status: "HApproved" },
                    { Status: "LApproved" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { Status: "HRejected" },
                        { Status: "DRejected" },
                        { Status: "LRejected" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { Status: "HRejected" },
                        { Status: "DRejected" },
                        { Status: "LRejected" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
          },
        },
      ]);
      ////////////////invoice///////////////////
      var countfour = await this.Invoice.aggregate([
        {
          $facet: {
            sumone: [
              { $match: { $or: [{ Status: "Funded" }] } },
              { $count: "total" },
            ],
            sum1: [
              { $match: { $or: [{ Status: "Funded" }] } },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $or: [
                    { Status: "Pending" },
                    { Status: "Validated" },
                    { Status: "DApproved" },
                    { Status: "LApproved" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $or: [
                    { Status: "Pending" },
                    { Status: "Validated" },
                    { Status: "DApproved" },
                    { Status: "LApproved" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
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
            Reject1: [
              {
                $match: {
                  $and: [
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

      /////////// Merchant///////
      if (countone[0].sumone[0] != undefined) {
        BussProWiseMerchantCases = countone[0].sumone[0].total;
      } else {
        BussProWiseMerchantCases = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        BussProWiseMerchantAmount = countone[0].sum1[0].total;
      } else {
        BussProWiseMerchantAmount = 0;
      }

      //////////disbursedcount
      if (countone[0].Disbursedone[0] != undefined) {
        BussProWiseMerchantDisbursedCases = countone[0].Disbursedone[0].total;
      } else {
        BussProWiseMerchantDisbursedCases = 0;
      }
      if (countone[0].Disbursed1[0] != undefined) {
        BussProWiseMerchantDisbursedAmount = countone[0].Disbursed1[0].total;
      } else {
        BussProWiseMerchantDisbursedAmount = 0;
      }

      if (countone[0].Rejectone[0] != undefined) {
        BussProWiseMerchantRejectCases = countone[0].Rejectone[0].total;
      } else {
        BussProWiseMerchantRejectCases = 0;
      }
      if (countone[0].Reject1[0] != undefined) {
        BussProWiseMerchantRejectAmount = countone[0].Reject1[0].total;
      } else {
        BussProWiseMerchantRejectAmount = 0;
      }

      if (countone[0].Pendingone[0] != undefined) {
        BussProWiseMerchantPendingCases = countone[0].Pendingone[0].total;
      } else {
        BussProWiseMerchantPendingCases = 0;
      }
      if (countone[0].Pending1[0] != undefined) {
        BussProWiseMerchantPendingAmount = countone[0].Pending1[0].total;
      } else {
        BussProWiseMerchantPendingAmount = 0;
      }

      ///////////////////Patient //////////////
      if (counttwo[0].sumone[0] != undefined) {
        BussProWisePatientCases = counttwo[0].sumone[0].total;
      } else {
        BussProWisePatientCases = 0;
      }
      if (counttwo[0].sum1[0] != undefined) {
        BussProWisePatientAmount = counttwo[0].sum1[0].total;
      } else {
        BussProWisePatientAmount = 0;
      }

      //////////disbursedcount
      if (counttwo[0].Inprocesstwo[0] != undefined) {
        BussProWisePatientDisbursedCases = counttwo[0].Inprocesstwo[0].total;
      } else {
        BussProWisePatientDisbursedCases = 0;
      }
      if (counttwo[0].Inprocess2[0] != undefined) {
        BussProWisePatientDisbursedAmount = counttwo[0].Inprocess2[0].total;
      } else {
        BussProWisePatientDisbursedAmount = 0;
      }

      if (counttwo[0].Rejectone[0] != undefined) {
        BussProWisePatientRejectCases = counttwo[0].Rejectone[0].total;
      } else {
        BussProWisePatientRejectCases = 0;
      }
      if (counttwo[0].Reject1[0] != undefined) {
        BussProWisePatientRejectAmount = counttwo[0].Reject1[0].total;
      } else {
        BussProWisePatientRejectAmount = 0;
      }

      /////////////////Supplier///////////
      if (countthree[0].sumone[0] != undefined) {
        BussProWiseSupplierCases = countthree[0].sumone[0].total;
      } else {
        BussProWiseSupplierCases = 0;
      }
      if (countthree[0].sum1[0] != undefined) {
        BussProWiseSupplierAmount = countthree[0].sum1[0].total;
      } else {
        BussProWiseSupplierAmount = 0;
      }

      if (countthree[0].Inprocesstwo[0] != undefined) {
        BussProWiseSupplierInProcessCases =
          countthree[0].Inprocesstwo[0].total;
      } else {
        BussProWiseSupplierInProcessCases = 0;
      }
      if (countthree[0].Inprocess2[0] != undefined) {
        BussProWiseSupplierInProcessAmount =
          countthree[0].Inprocess2[0].total;
      } else {
        BussProWiseSupplierInProcessAmount = 0;
      }

      if (countthree[0].Rejectone[0] != undefined) {
        BussProWiseSupplierRejectCases = countthree[0].Rejectone[0].total;
      } else {
        BussProWiseSupplierRejectCases = 0;
      }
      if (countthree[0].Reject1[0] != undefined) {
        BussProWiseSupplierRejectAmount = countthree[0].Reject1[0].total;
      } else {
        BussProWiseSupplierRejectAmount = 0;
      }

      //////////////////Invoice/////////////
      if (countfour[0].sumone[0] != undefined) {
        BussProWiseInvoiceCases = countfour[0].sumone[0].total;
      } else {
        BussProWiseInvoiceCases = 0;
      }
      if (countfour[0].sum1[0] != undefined) {
        BussProWiseInvoiceAmount = countfour[0].sum1[0].total;
      } else {
        BussProWiseInvoiceAmount = 0;
      }

      if (countfour[0].Inprocesstwo[0] != undefined) {
        BussProWiseInvoiceInProcessCases = countfour[0].Inprocesstwo[0].total;
      } else {
        BussProWiseInvoiceInProcessCases = 0;
      }
      if (countfour[0].Inprocess2[0] != undefined) {
        BussProWiseInvoiceInProcessAmount = countfour[0].Inprocess2[0].total;
      } else {
        BussProWiseInvoiceInProcessAmount = 0;
      }

      if (countfour[0].Rejectone[0] != undefined) {
        BussProWiseInvoiceRejectCases = countfour[0].Rejectone[0].total;
      } else {
        BussProWiseInvoiceRejectCases = 0;
      }
      if (countfour[0].Reject1[0] != undefined) {
        BussProWiseInvoiceRejectAmount = countfour[0].Reject1[0].total;
      } else {
        BussProWiseInvoiceRejectAmount = 0;
      }

      BussProWisePatientInProcessCases =
        BussProWisePatientCases -
        (BussProWisePatientDisbursedCases + BussProWisePatientRejectCases);
      BussProWisePatientInProcessAmount =
        BussProWisePatientAmount -
        (BussProWisePatientDisbursedAmount + BussProWisePatientRejectAmount);

      var resgetDashboardForBussinessProductWise = {
        data: {
          success: true,
          BussProWiseTotalInvoiceCases: BussProWiseInvoiceCases,
          BussProWiseTotalInvoiceAmount: BussProWiseInvoiceAmount,
          BussProWiseTotalSupplierCases: BussProWiseSupplierCases,
          BussProWiseTotalSupplierAmount: BussProWiseSupplierAmount,
          BussProWiseTotalMerchantCases: BussProWiseMerchantCases,
          BussProWiseTotalMerchantAmount: BussProWiseMerchantAmount,
          BussProWiseTotalPatientCases: BussProWisePatientCases,
          BussProWiseTotalPatientAmount: BussProWisePatientAmount,

          BussProWiseTotalInvoiceInProcessCases:
            BussProWiseInvoiceInProcessCases,
          BussProWiseTotalInvoiceInProcessAmount:
            BussProWiseInvoiceInProcessAmount,
          BussProWiseTotalSupplierInProcessCases:
            BussProWiseSupplierInProcessCases,
          BussProWiseTotalSupplierInProcessAmount:
            BussProWiseSupplierInProcessAmount,
          BussProWiseTotalMerchantInProcessCases:
            BussProWiseMerchantPendingCases,
          BussProWiseTotalMerchantInProcessAmount:
            BussProWiseMerchantPendingAmount,
          BussProWiseTotalPatientInProcessCases:
            BussProWisePatientInProcessCases,
          BussProWiseTotalPatientInProcessAmount:
            BussProWisePatientInProcessAmount,

          BussProWiseTotalInvoiceRejectCases: BussProWiseInvoiceRejectCases,
          BussProWiseTotalInvoiceRejectAmount: BussProWiseInvoiceRejectAmount,
          BussProWiseTotalSupplierRejectCases: BussProWiseSupplierRejectCases,
          BussProWiseTotalSupplierRejectAmount: BussProWiseSupplierRejectAmount,
          BussProWiseTotalMerchantRejectCases: BussProWiseMerchantRejectCases,
          BussProWiseTotalMerchantRejectAmount: BussProWiseMerchantRejectAmount,
          BussProWiseTotalPatientRejectCases: BussProWisePatientRejectCases,
          BussProWiseTotalPatientRejectAmount: BussProWisePatientRejectAmount,


        }
      }




      //getDashboardForMonth
      var MonthInvoiceInProcessCases = 0;
      var MonthInvoiceDisbursedCases = 0;
      var MonthInvoiceInProcessAmount = 0;
      var MonthInvoiceDisbursedAmount = 0;

      var MonthSupplierInProcessCases = 0;
      var MonthSupplierDisbursedCases = 0;
      var MonthSupplierInProcessAmount = 0;
      var MonthSupplierDisbursedAmount = 0;

      var MonthMerchantInProcessCases = 0;
      var MonthMerchantDisbursedCases = 0;
      var MonthMerchantInProcessAmount = 0;
      var MonthMerchantDisbursedAmount = 0;

      var MonthPatientInProcessCases = 0;
      var MonthPatientDisbursedCases = 0;
      var MonthPatientInProcessAmount = 0;
      var MonthPatientDisbursedAmount = 0;

      var MonthPatientCases = 0;
      var MonthPatientRejectCases = 0;
      var MonthPatientAmount = 0;
      var MonthPatientRejectAmount = 0;

      var MonthMerchantCases = 0;
      var MonthMerchantRejectCases = 0;
      var MonthMerchantAmount = 0;
      var MonthMerchantRejectAmount = 0;

      var MonthInvoiceExpectedAmount = 0;
      var MonthSupplierExpectedAmount = 0;
      var MonthInvoiceActualAmount = 0;
      var MonthSupplieActualAmount = 0;

      var MonthHApprovedCases = 0;

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
      var todaydate = new Date();

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Pendingone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "NICT to work on" },
                        { ActionNeeded: "LL is working" },
                        { ActionNeeded: "Not Interested" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Pending1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "NICT to work on" },
                        { ActionNeeded: "LL is working" },
                        { ActionNeeded: "Not Interested" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "Rejected" },
                        { ActionNeeded: "Loan reversed" },
                        { ActionNeeded: "Duplicate" },
                        { ActionNeeded: "Fraud case" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "Rejected" },
                        { ActionNeeded: "Loan reversed" },
                        { ActionNeeded: "Duplicate" },
                        { ActionNeeded: "Fraud case" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ ActionNeeded: "Disbursed" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ ActionNeeded: "Disbursed" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////////////Patient ////////////
      var counttwo = await this.patientLoanModel.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
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
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
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
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////supplier////////////////
      var countthree = await this.Invoices.aggregate([
        {
          $facet: {
            ExpectedAmount: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            ActualAmount: [
              {
                $match: {
                  $and: [{ updatedAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$AmountPaid" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            HApproved: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "HApproved" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
          },
        },
      ]);
      ////////////////invoice///////////////////
      var countfour = await this.Invoice.aggregate([
        {
          $facet: {
            ExpectedAmount: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            ActualAmount: [
              {
                $match: {
                  $and: [{ updatedAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$ApporvedAmount" } } },
            ],
            Inprocesstwo: [
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
            Inprocess2: [
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
            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
          },
        },
      ]);
      ///////merchant

      if (countone[0].sumone[0] != undefined) {
        MonthMerchantCases = countone[0].sumone[0].total;
      } else {
        MonthMerchantCases = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        MonthMerchantAmount = countone[0].sum1[0].total;
      } else {
        MonthMerchantAmount = 0;
      }

      if (countone[0].Rejectone[0] != undefined) {
        MonthMerchantRejectCases = countone[0].Rejectone[0].total;
      } else {
        MonthMerchantRejectCases = 0;
      }
      if (countone[0].Reject1[0] != undefined) {
        MonthMerchantRejectAmount = countone[0].Reject1[0].total;
      } else {
        MonthMerchantRejectAmount = 0;
      }

      if (countone[0].Disbursedone[0] != undefined) {
        MonthMerchantDisbursedCases = countone[0].Disbursedone[0].total;
      } else {
        MonthMerchantDisbursedCases = 0;
      }
      if (countone[0].Disbursed1[0] != undefined) {
        MonthMerchantDisbursedAmount = countone[0].Disbursed1[0].total;
      } else {
        MonthMerchantDisbursedAmount = 0;
      }

      if (countone[0].Pendingone[0] != undefined) {
        MonthMerchantInProcessCases = countone[0].Pendingone[0].total;
      } else {
        MonthMerchantInProcessCases = 0;
      }
      if (countone[0].Pending1[0] != undefined) {
        MonthMerchantInProcessAmount = countone[0].Pending1[0].total;
      } else {
        MonthMerchantInProcessAmount = 0;
      }

      //////////////////Patient

      if (counttwo[0].sumone[0] != undefined) {
        MonthPatientCases = counttwo[0].sumone[0].total;
      } else {
        MonthPatientCases = 0;
      }
      if (counttwo[0].sum1[0] != undefined) {
        MonthPatientAmount = counttwo[0].sum1[0].total;
      } else {
        MonthPatientAmount = 0;
      }

      if (counttwo[0].Rejectone[0] != undefined) {
        MonthPatientRejectCases = counttwo[0].Rejectone[0].total;
      } else {
        MonthPatientRejectCases = 0;
      }
      if (counttwo[0].Reject1[0] != undefined) {
        MonthPatientRejectAmount = counttwo[0].Reject1[0].total;
      } else {
        MonthPatientRejectAmount = 0;
      }

      if (counttwo[0].Disbursedone[0] != undefined) {
        MonthPatientDisbursedCases = counttwo[0].Disbursedone[0].total;
      } else {
        MonthPatientDisbursedCases = 0;
      }
      if (counttwo[0].Disbursed1[0] != undefined) {
        MonthPatientDisbursedAmount = counttwo[0].Disbursed1[0].total;
      } else {
        MonthPatientDisbursedAmount = 0;
      }

      /////////////////////suppplier

      if (countthree[0].Inprocesstwo[0] != undefined) {
        MonthSupplierInProcessCases = countthree[0].Inprocesstwo[0].total;
      } else {
        MonthSupplierInProcessCases = 0;
      }
      if (countthree[0].Inprocess2[0] != undefined) {
        MonthSupplierInProcessAmount = countthree[0].Inprocess2[0].total;
      } else {
        MonthSupplierInProcessAmount = 0;
      }

      if (countthree[0].Disbursedone[0] != undefined) {
        MonthSupplierDisbursedCases = countthree[0].Disbursedone[0].total;
      } else {
        MonthSupplierDisbursedCases = 0;
      }
      if (countthree[0].Disbursed1[0] != undefined) {
        MonthSupplierDisbursedAmount = countthree[0].Disbursed1[0].total;
      } else {
        MonthSupplierDisbursedAmount = 0;
      }

      if (countthree[0].ExpectedAmount[0] != undefined) {
        MonthSupplierExpectedAmount = countthree[0].ExpectedAmount[0].total;
      } else {
        MonthSupplierExpectedAmount = 0;
      }
      if (countthree[0].ActualAmount[0] != undefined) {
        MonthSupplieActualAmount = countthree[0].ActualAmount[0].total;
      } else {
        MonthSupplieActualAmount = 0;
      }

      if (countthree[0].HApproved[0] != undefined) {
        MonthHApprovedCases = countthree[0].HApproved[0].total;
      } else {
        MonthHApprovedCases = 0;
      }

      ///////////////////////Invoice

      if (countfour[0].Inprocesstwo[0] != undefined) {
        MonthInvoiceInProcessCases = countfour[0].Inprocesstwo[0].total;
      } else {
        MonthInvoiceInProcessCases = 0;
      }
      if (countfour[0].Inprocess2[0] != undefined) {
        MonthInvoiceInProcessAmount = countfour[0].Inprocess2[0].total;
      } else {
        MonthInvoiceInProcessAmount = 0;
      }

      if (countfour[0].Disbursedone[0] != undefined) {
        MonthInvoiceDisbursedCases = countfour[0].Disbursedone[0].total;
      } else {
        MonthInvoiceDisbursedCases = 0;
      }
      if (countfour[0].Disbursed1[0] != undefined) {
        MonthInvoiceDisbursedAmount = countfour[0].Disbursed1[0].total;
      } else {
        MonthInvoiceDisbursedAmount = 0;
      }

      if (countfour[0].ExpectedAmount[0] != undefined) {
        MonthInvoiceExpectedAmount = countfour[0].ExpectedAmount[0].total;
      } else {
        MonthInvoiceExpectedAmount = 0;
      }
      if (countfour[0].ActualAmount[0] != undefined) {
        MonthInvoiceActualAmount = countfour[0].ActualAmount[0].total;
      } else {
        MonthInvoiceActualAmount = 0;
      }

      var MonthPatientInProcessCases =
        MonthPatientCases -
        (MonthPatientRejectCases + MonthPatientDisbursedCases);
      var MonthPatientInProcessAmount =
        MonthPatientAmount -
        (MonthPatientRejectAmount + MonthPatientDisbursedAmount);

      var MonthInProcessCases =
        MonthMerchantInProcessCases +
        MonthPatientInProcessCases +
        MonthSupplierInProcessCases +
        MonthInvoiceInProcessCases;
      var MonthInProcessAmount =
        MonthMerchantInProcessAmount +
        MonthPatientInProcessAmount +
        MonthSupplierInProcessAmount +
        MonthInvoiceInProcessAmount;
      var MonthDisbursedCases =
        MonthMerchantDisbursedCases +
        MonthPatientDisbursedCases +
        MonthSupplierDisbursedCases +
        MonthInvoiceDisbursedCases;
      var MonthDisbursedAmount =
        MonthMerchantDisbursedAmount +
        MonthPatientDisbursedAmount +
        MonthSupplierDisbursedAmount +
        MonthInvoiceDisbursedAmount;

      var ExpectedAmount =
        MonthInvoiceExpectedAmount + MonthSupplierExpectedAmount;
      var ActualAmount = MonthInvoiceActualAmount + MonthSupplieActualAmount;

      var resgetDashboardForMonth = {
        data: {
          success: true,
          MonthTotalInProcessCases: MonthInProcessCases,
          MonthTotalInProcessAmount: MonthInProcessAmount,
          MonthTotalDisbursedCases: MonthDisbursedCases,
          MonthTotalDisbursedAmount: MonthDisbursedAmount,
          ExpectedAmount: ExpectedAmount,
          ActualAmount: ActualAmount,
          MonthHApprovedCases: MonthHApprovedCases,
        }
      }


      //getDashboardForMonthProductWise
      var MonthProWiseInvoiceCases = 0;
      var MonthProWiseInvoiceInProcessCases = 0;
      var MonthProWiseInvoiceRejectCases = 0;
      var MonthProWiseInvoiceAmount = 0;
      var MonthProWiseInvoiceInProcessAmount = 0;
      var MonthProWiseInvoiceRejectAmount = 0;

      var MonthProWiseSupplierCases = 0;
      var MonthProWiseSupplierInProcessCases = 0;
      var MonthProWiseSupplierRejectCases = 0;
      var MonthProWiseSupplierAmount = 0;
      var MonthProWiseSupplierInProcessAmount = 0;
      var MonthProWiseSupplierRejectAmount = 0;

      var MonthProWiseMerchantCases = 0;
      var MonthProWiseMerchantInProcessCases = 0;
      var MonthProWiseMerchantRejectCases = 0;
      var MonthProWiseMerchantAmount = 0;
      var MonthProWiseMerchantInProcessAmount = 0;
      var MonthProWiseMerchantRejectAmount = 0;

      var MonthProWisePatientCases = 0;
      var MonthProWisePatientInProcessCases = 0;
      var MonthProWisePatientRejectCases = 0;
      var MonthProWisePatientAmount = 0;
      var MonthProWisePatientInProcessAmount = 0;
      var MonthProWisePatientRejectAmount = 0;

      var BussProWiseMerchantDisbursedCases = 0;
      var BussProWiseMerchantDisbursedAmount = 0;
      var BussProWisePatientDisbursedCases = 0;
      var BussProWisePatientDisbursedAmount = 0;

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
      var todaydate = new Date();

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Disbursed" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Disbursed" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Pendingone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "NICT to work on" },
                        { ActionNeeded: "LL is working" },
                        { ActionNeeded: "Not Interested" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Pending1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "NICT to work on" },
                        { ActionNeeded: "LL is working" },
                        { ActionNeeded: "Not Interested" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "Rejected" },
                        { ActionNeeded: "Loan reversed" },
                        { ActionNeeded: "Duplicate" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "Rejected" },
                        { ActionNeeded: "Loan reversed" },
                        { ActionNeeded: "Duplicate" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ ActionNeeded: "Disbursed" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ ActionNeeded: "Disbursed" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////////////Patient ////////////
      var counttwo = await this.patientLoanModel.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
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
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
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
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////supplier////////////////
      var countthree = await this.Invoices.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "HRejected" },
                        { Status: "DRejected" },
                        { Status: "LRejected" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "HRejected" },
                        { Status: "DRejected" },
                        { Status: "LRejected" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
          },
        },
      ]);
      ////////////////invoice///////////////////
      var countfour = await this.Invoice.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            Inprocesstwo: [
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
            Inprocess2: [
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
            Rejectone: [
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
            Reject1: [
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
          },
        },
      ]);
      ///////merchant

      if (countone[0].sumone[0] != undefined) {
        MonthProWiseMerchantCases = countone[0].sumone[0].total;
      } else {
        MonthProWiseMerchantCases = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        MonthProWiseMerchantAmount = countone[0].sum1[0].total;
      } else {
        MonthProWiseMerchantAmount = 0;
      }

      /////////disbursed
      if (countone[0].Disbursedone[0] != undefined) {
        BussProWiseMerchantDisbursedCases = countone[0].Disbursedone[0].total;
      } else {
        BussProWiseMerchantDisbursedCases = 0;
      }
      if (countone[0].Disbursed1[0] != undefined) {
        BussProWiseMerchantDisbursedAmount = countone[0].Disbursed1[0].total;
      } else {
        BussProWiseMerchantDisbursedAmount = 0;
      }

      if (countone[0].Rejectone[0] != undefined) {
        MonthProWiseMerchantRejectCases = countone[0].Rejectone[0].total;
      } else {
        MonthProWiseMerchantRejectCases = 0;
      }
      if (countone[0].Reject1[0] != undefined) {
        MonthProWiseMerchantRejectAmount = countone[0].Reject1[0].total;
      } else {
        MonthProWiseMerchantRejectAmount = 0;
      }

      if (countone[0].Pendingone[0] != undefined) {
        MonthProWiseMerchantInProcessCases = countone[0].Pendingone[0].total;
      } else {
        MonthProWiseMerchantInProcessCases = 0;
      }
      if (countone[0].Pending1[0] != undefined) {
        MonthProWiseMerchantInProcessAmount = countone[0].Pending1[0].total;
      } else {
        MonthProWiseMerchantInProcessAmount = 0;
      }

      //////////////////Patient
      if (counttwo[0].sumone[0] != undefined) {
        MonthProWisePatientCases = counttwo[0].sumone[0].total;
      } else {
        MonthProWisePatientCases = 0;
      }
      if (counttwo[0].sum1[0] != undefined) {
        MonthProWisePatientAmount = counttwo[0].sum1[0].total;
      } else {
        MonthProWisePatientAmount = 0;
      }
      /////////disbursed
      if (counttwo[0].Inprocesstwo[0] != undefined) {
        BussProWisePatientDisbursedCases = counttwo[0].Inprocesstwo[0].total;
      } else {
        BussProWisePatientDisbursedCases = 0;
      }
      if (counttwo[0].Inprocess2[0] != undefined) {
        BussProWisePatientDisbursedAmount = counttwo[0].Inprocess2[0].total;
      } else {
        BussProWisePatientDisbursedAmount = 0;
      }

      if (counttwo[0].Rejectone[0] != undefined) {
        MonthProWisePatientRejectCases = counttwo[0].Rejectone[0].total;
      } else {
        MonthProWisePatientRejectCases = 0;
      }
      if (counttwo[0].Reject1[0] != undefined) {
        MonthProWisePatientRejectAmount = counttwo[0].Reject1[0].total;
      } else {
        MonthProWisePatientRejectAmount = 0;
      }

      /////////////////////suppplier
      if (countthree[0].sumone[0] != undefined) {
        MonthProWiseSupplierCases = countthree[0].sumone[0].total;
      } else {
        MonthProWiseSupplierCases = 0;
      }
      if (countthree[0].sum1[0] != undefined) {
        MonthProWiseSupplierAmount = countthree[0].sum1[0].total;
      } else {
        MonthProWiseSupplierAmount = 0;
      }

      if (countthree[0].Inprocesstwo[0] != undefined) {
        MonthProWiseSupplierInProcessCases =
          countthree[0].Inprocesstwo[0].total;
      } else {
        MonthProWiseSupplierInProcessCases = 0;
      }
      if (countthree[0].Inprocess2[0] != undefined) {
        MonthProWiseSupplierInProcessAmount =
          countthree[0].Inprocess2[0].total;
      } else {
        MonthProWiseSupplierInProcessAmount = 0;
      }

      if (countthree[0].Rejectone[0] != undefined) {
        MonthProWiseSupplierRejectCases = countthree[0].Rejectone[0].total;
      } else {
        MonthProWiseSupplierRejectCases = 0;
      }
      if (countthree[0].Reject1[0] != undefined) {
        MonthProWiseSupplierRejectAmount = countthree[0].Reject1[0].total;
      } else {
        MonthProWiseSupplierRejectAmount = 0;
      }

      ///////////////////////Invoice
      if (countfour[0].sumone[0] != undefined) {
        MonthProWiseInvoiceCases = countfour[0].sumone[0].total;
      } else {
        MonthProWiseInvoiceCases = 0;
      }
      if (countfour[0].sum1[0] != undefined) {
        MonthProWiseInvoiceAmount = countfour[0].sum1[0].total;
      } else {
        MonthProWiseInvoiceAmount = 0;
      }

      if (countfour[0].Inprocesstwo[0] != undefined) {
        MonthProWiseInvoiceInProcessCases =
          countfour[0].Inprocesstwo[0].total;
      } else {
        MonthProWiseInvoiceInProcessCases = 0;
      }
      if (countfour[0].Inprocess2[0] != undefined) {
        MonthProWiseInvoiceInProcessAmount = countfour[0].Inprocess2[0].total;
      } else {
        MonthProWiseInvoiceInProcessAmount = 0;
      }

      if (countfour[0].Rejectone[0] != undefined) {
        MonthProWiseInvoiceRejectCases = countfour[0].Rejectone[0].total;
      } else {
        MonthProWiseInvoiceRejectCases = 0;
      }
      if (countfour[0].Reject1[0] != undefined) {
        MonthProWiseInvoiceRejectAmount = countfour[0].Reject1[0].total;
      } else {
        MonthProWiseInvoiceRejectAmount = 0;
      }

      var MonthProWisePatientInProcessCases =
        MonthProWisePatientCases -
        (BussProWisePatientDisbursedCases + MonthProWisePatientRejectCases);
      var MonthProWisePatientInProcessAmount =
        MonthProWisePatientAmount -
        (BussProWisePatientDisbursedAmount + MonthProWisePatientRejectAmount);

      var resgetDashboardForMonthProductWise = {
        data: {
          success: true,
          MonthProWiseTotalInvoiceCases: MonthProWiseInvoiceCases,
          MonthProWiseTotalInvoiceAmount: MonthProWiseInvoiceAmount,
          MonthProWiseTotalSupplierCases: MonthProWiseSupplierCases,
          MonthProWiseTotalSupplierAmount: MonthProWiseSupplierAmount,
          MonthProWiseTotalMerchantCases: MonthProWiseMerchantCases,
          MonthProWiseTotalMerchantAmount: MonthProWiseMerchantAmount,
          MonthProWiseTotalPatientCases: MonthProWisePatientCases,
          MonthProWiseTotalPatientAmount: MonthProWisePatientAmount,
          MonthProWiseTotalInvoiceInProcessCases:
            MonthProWiseInvoiceInProcessCases,
          MonthProWiseTotalInvoiceInProcessAmount:
            MonthProWiseInvoiceInProcessAmount,
          MonthProWiseTotalSupplierInProcessCases:
            MonthProWiseSupplierInProcessCases,
          MonthProWiseTotalSupplierInProcessAmount:
            MonthProWiseSupplierInProcessAmount,
          MonthProWiseTotalMerchantInProcessCases:
            MonthProWiseMerchantInProcessCases,
          MonthProWiseTotalMerchantInProcessAmount:
            MonthProWiseMerchantInProcessAmount,
          MonthProWiseTotalPatientInProcessCases:
            MonthProWisePatientInProcessCases,
          MonthProWiseTotalPatientInProcessAmount:
            MonthProWisePatientInProcessAmount,
          MonthProWiseTotalInvoiceRejectCases: MonthProWiseInvoiceRejectCases,
          MonthProWiseTotalInvoiceRejectAmount: MonthProWiseInvoiceRejectAmount,
          MonthProWiseTotalSupplierRejectCases: MonthProWiseSupplierRejectCases,
          MonthProWiseTotalSupplierRejectAmount:
            MonthProWiseSupplierRejectAmount,
          MonthProWiseTotalMerchantRejectCases: MonthProWiseMerchantRejectCases,
          MonthProWiseTotalMerchantRejectAmount:
            MonthProWiseMerchantRejectAmount,
          MonthProWiseTotalPatientRejectCases: MonthProWisePatientRejectCases,
          MonthProWiseTotalPatientRejectAmount: MonthProWisePatientRejectAmount,

        }
      }

      //getDashboardForOverviewBussiness
      var nums = [];
      var char = [];
      var d = [];
      var name = [];

      var BussInvoiceRepayCases = 0;
      var BussInvoiceInProcessCases = 0;
      var BussInvoiceDisbursedCases = 0;
      var BussInvoiceRepayAmount = 0;
      var BussInvoiceInProcessAmount = 0;
      var BussInvoiceDisbursedAmount = 0;

      var BussSupplierRepayCases = 0;
      var BussSupplierInProcessCases = 0;
      var BussSupplierDisbursedCases = 0;
      var BussSupplierRepayAmount = 0;
      var BussSupplierInProcessAmount = 0;
      var BussSupplierDisbursedAmount = 0;

      var BussMerchantRepayCases = 0;
      var BussMerchantInProcessCases = 0;
      var BussMerchantDisbursedCases = 0;
      var BussMerchantRepayAmount = 0;
      var BussMerchantInProcessAmount = 0;
      var BussMerchantDisbursedAmount = 0;

      var BussPatientRepayCases = 0;
      var BussPatientInProcessCases = 0;
      var BussPatientDisbursedCases = 0;
      var BussPatientRepayAmount = 0;
      var BussPatientInProcessAmount = 0;
      var BussPatientDisbursedAmount = 0;

      var BussPatientCases = 0;
      var BussPatientRejectCases = 0;
      var BussPatientAmount = 0;
      var BussPatientRejectAmount = 0;

      var BussMerchantCases = 0;
      var BussMerchantRejectCases = 0;
      var BussMerchantAmount = 0;
      var BussMerchantRejectAmount = 0;

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [{ $match: {} }, { $count: "total" }],
            sum1: [
              { $match: {} },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Pendingone: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "NICT to work on" },
                    { ActionNeeded: "LL is working" },
                    { ActionNeeded: "Not Interested" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Pending1: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "NICT to work on" },
                    { ActionNeeded: "LL is working" },
                    { ActionNeeded: "Not Interested" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Rejectone: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "Rejected" },
                    { ActionNeeded: "Loan reversed" },
                    { ActionNeeded: "Duplicate" },
                    { ActionNeeded: "Fraud case" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $or: [
                    { ActionNeeded: "Rejected" },
                    { ActionNeeded: "Loan reversed" },
                    { ActionNeeded: "Duplicate" },
                    { ActionNeeded: "Fraud case" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Disbursedone: [
              { $match: { $or: [{ ActionNeeded: "Disbursed" }] } },
              { $count: "total" },
            ],
            Disbursed1: [
              { $match: { $or: [{ ActionNeeded: "Disbursed" }] } },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////////////Patient ////////////
      var counttwo = await this.patientLoanModel.aggregate([
        {
          $facet: {
            sumone: [{ $match: {} }, { $count: "total" }],
            sum1: [
              { $match: {} },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
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
                  ],
                },
              },
              { $count: "total" },
            ],
          },
        },
      ]);
      /////////////////////supplier////////////////
      var countthree = await this.Invoices.aggregate([
        {
          $facet: {
            Repayone: [
              { $match: { $and: [{ $or: [{ Status: "Repaid" }] }] } },
              { $count: "total" },
            ],
            Disbursedone: [
              {
                $match: {
                  $and: [
                    {
                      $or: [
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
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
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
          },
        },
      ]);
      ////////////////invoice///////////////////
      var countfour = await this.Invoice.aggregate([
        {
          $facet: {
            Approvedone: [
              { $match: { $and: [{ $or: [{ Status: "DApproved" }] }] } },
              { $count: "total" },
            ],
            Rejectone: [
              { $match: { $and: [{ $or: [{ Status: "DRejected" }] }] } },
              { $count: "total" },
            ],
            Disbursedone: [
              { $match: { $and: [{ $or: [{ Status: "Funded" }] }] } },
              { $count: "total" },
            ],
            Disbursed1: [
              { $match: { $and: [{ $or: [{ Status: "Funded" }] }] } },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
          },
        },
      ]);

      /////////// Merchant///////

      if (countone[0].sumone[0] != undefined) {
        BussMerchantCases = countone[0].sumone[0].total;
      } else {
        BussMerchantCases = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        BussMerchantAmount = countone[0].sum1[0].total;
      } else {
        BussMerchantAmount = 0;
      }

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

      ///////////////////Patient //////////////

      if (counttwo[0].sumone[0] != undefined) {
        BussPatientCases = counttwo[0].sumone[0].total;
      } else {
        BussPatientCases = 0;
      }
      if (counttwo[0].sum1[0] != undefined) {
        BussPatientAmount = counttwo[0].sum1[0].total;
      } else {
        BussPatientAmount = 0;
      }

      if (counttwo[0].Rejectone[0] != undefined) {
        BussPatientRejectCases = counttwo[0].Rejectone[0].total;
      } else {
        BussPatientRejectCases = 0;
      }

      if (counttwo[0].Disbursedone[0] != undefined) {
        BussPatientDisbursedCases = counttwo[0].Disbursedone[0].total;
      } else {
        BussPatientDisbursedCases = 0;
      }

      /////////////////Supplier///////////

      if (countthree[0].Disbursedone[0] != undefined) {
        BussSupplierDisbursedCases = countthree[0].Disbursedone[0].total;
      } else {
        BussSupplierDisbursedCases = 0;
      }
      if (countthree[0].Disbursed1[0] != undefined) {
        BussSupplierDisbursedAmount = countthree[0].Disbursed1[0].total;
      } else {
        BussSupplierDisbursedAmount = 0;
      }

      //////////////////Invoice/////////////
      if (countfour[0].Approvedone[0] != undefined) {
        BussInvoiceRepayCases = countfour[0].Approvedone[0].total;
      } else {
        BussInvoiceRepayCases = 0;
      }
      if (countfour[0].Rejectone[0] != undefined) {
        BussInvoiceRepayAmount = countfour[0].Rejectone[0].total;
      } else {
        BussInvoiceRepayAmount = 0;
      }

      if (countfour[0].Disbursedone[0] != undefined) {
        BussInvoiceDisbursedCases = countfour[0].Disbursedone[0].total;
      } else {
        BussInvoiceDisbursedCases = 0;
      }
      if (countfour[0].Disbursed1[0] != undefined) {
        BussInvoiceDisbursedAmount = countfour[0].Disbursed1[0].total;
      } else {
        BussInvoiceDisbursedAmount = 0;
      }

      var NoOfLeads = BussMerchantCases + BussPatientCases;
      var AmountOfLeads = BussMerchantAmount + BussPatientAmount;
      var InvoiceApproved = BussInvoiceRepayCases + BussPatientDisbursedCases;
      var RejectCount = BussInvoiceRepayAmount + BussPatientRejectCases;
      var Disbursedcount =
        BussSupplierDisbursedCases +
        BussInvoiceDisbursedCases +
        BussMerchantDisbursedCases;
      var DisbursedAmount =
        BussSupplierDisbursedAmount +
        BussInvoiceDisbursedAmount +
        BussMerchantDisbursedAmount;

      var resgetDashboardForOverviewBussiness = {
        data: {

          success: true,
          NoOfLeads: NoOfLeads,
          AmountOfLeads: AmountOfLeads,
          InvoiceApproved: InvoiceApproved,
          RejectCount: RejectCount,
          Disbursedcount: Disbursedcount,
          DisbursedAmount: DisbursedAmount,

        }
      }

      //getDashboardForOverviewMonth
      var MonthInvoiceInProcessCases = 0;
      var MonthInvoiceDisbursedCases = 0;
      var MonthInvoiceInProcessAmount = 0;
      var MonthInvoiceDisbursedAmount = 0;

      var MonthSupplierInProcessCases = 0;
      var MonthSupplierDisbursedCases = 0;
      var MonthSupplierInProcessAmount = 0;
      var MonthSupplierDisbursedAmount = 0;

      var MonthMerchantInProcessCases = 0;
      var MonthMerchantDisbursedCases = 0;
      var MonthMerchantInProcessAmount = 0;
      var MonthMerchantDisbursedAmount = 0;

      var MonthPatientInProcessCases = 0;
      var MonthPatientDisbursedCases = 0;
      var MonthPatientDisbursedCases1 = 0;
      var MonthPatientInProcessAmount = 0;
      var MonthPatientDisbursedAmount = 0;

      var MonthPatientCases = 0;
      var MonthPatientRejectCases = 0;
      var MonthPatientAmount = 0;
      var MonthPatientRejectAmount = 0;

      var MonthMerchantCases = 0;
      var MonthMerchantRejectCases = 0;
      var MonthMerchantAmount = 0;
      var MonthMerchantRejectAmount = 0;

      var MonthInvoiceExpectedAmount = 0;
      var MonthSupplierExpectedAmount = 0;
      var MonthInvoiceActualAmount = 0;
      var MonthSupplieActualAmount = 0;

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
      var todaydate = new Date();

      var countone = await this.Approvedloans.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Pendingone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "NICT to work on" },
                        { ActionNeeded: "LL is working" },
                        { ActionNeeded: "Not Interested" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Pending1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "NICT to work on" },
                        { ActionNeeded: "LL is working" },
                        { ActionNeeded: "Not Interested" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "Rejected" },
                        { ActionNeeded: "Loan reversed" },
                        { ActionNeeded: "Duplicate" },
                        { ActionNeeded: "Fraud case" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Reject1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ActionNeeded: "Rejected" },
                        { ActionNeeded: "Loan reversed" },
                        { ActionNeeded: "Duplicate" },
                        { ActionNeeded: "Fraud case" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],

            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ ActionNeeded: "Disbursed" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ ActionNeeded: "Disbursed" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
            ],
          },
        },
      ]);
      /////////////////////////////Patient ////////////
      var counttwo = await this.patientLoanModel.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $count: "total" },
            ],
            sum1: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$loanAmount" } } },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { ApproveOrReject: "REJECT" },
                        { ApproveOrReject: "Reject" },
                        { ApproveOrReject: "reject" },
                        { ApproveOrReject: "FALSE" },
                        { ApproveOrReject: "false" },
                        { ApproveOrReject: "False" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursedtwo: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: this1, $lte: todaydate } },
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
                  ],
                },
              },
              { $count: "total" },
            ],
          },
        },
      ]);
      /////////////////////supplier////////////////
      var countthree = await this.Invoices.aggregate([
        {
          $facet: {
            ExpectedAmount: [
              {
                $match: {
                  $and: [{ createdAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            ActualAmount: [
              {
                $match: {
                  $and: [{ updatedAt: { $gte: this1, $lte: todaydate } }],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$AmountPaid" } } },
            ],
            Inprocesstwo: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Inprocess2: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Pending" },
                        { Status: "HApproved" },
                        { Status: "LApproved" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    {
                      $or: [
                        { Status: "Funded" },
                        { Status: "Repaid" },
                        { Status: "HRepaid" },
                      ],
                    },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$InvoiceAmount" } } },
            ],
          },
        },
      ]);
      ////////////////invoice///////////////////
      var countfour = await this.Invoice.aggregate([
        {
          $facet: {
            Disbursedone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $count: "total" },
            ],
            Disbursed1: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { $or: [{ Status: "Funded" }] },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $sum: "$claimAmount" } } },
            ],
            Approved: [
              {
                $match: {
                  $and: [
                    { updatedAt: { $gte: this1, $lte: todaydate } },
                    { Status: "DApproved" },
                  ],
                },
              },
              { $count: "total" },
            ],
            Rejectone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { Status: "DRejected" },
                  ],
                },
              },
              { $count: "total" },
            ],
          },
        },
      ]);
      ///////merchant

      if (countone[0].sumone[0] != undefined) {
        MonthMerchantCases = countone[0].sumone[0].total;
      } else {
        MonthMerchantCases = 0;
      }
      if (countone[0].sum1[0] != undefined) {
        MonthMerchantAmount = countone[0].sum1[0].total;
      } else {
        MonthMerchantAmount = 0;
      }

      if (countone[0].Disbursedone[0] != undefined) {
        MonthMerchantDisbursedCases = countone[0].Disbursedone[0].total;
      } else {
        MonthMerchantDisbursedCases = 0;
      }
      if (countone[0].Disbursed1[0] != undefined) {
        MonthMerchantDisbursedAmount = countone[0].Disbursed1[0].total;
      } else {
        MonthMerchantDisbursedAmount = 0;
      }

      //////////////////Patient

      if (counttwo[0].sumone[0] != undefined) {
        MonthPatientCases = counttwo[0].sumone[0].total;
      } else {
        MonthPatientCases = 0;
      }
      if (counttwo[0].sum1[0] != undefined) {
        MonthPatientAmount = counttwo[0].sum1[0].total;
      } else {
        MonthPatientAmount = 0;
      }

      if (counttwo[0].Rejectone[0] != undefined) {
        MonthPatientRejectCases = counttwo[0].Rejectone[0].total;
      } else {
        MonthPatientRejectCases = 0;
      }

      if (counttwo[0].Disbursedtwo[0] != undefined) {
        MonthPatientDisbursedCases1 = counttwo[0].Disbursedtwo[0].total;
      } else {
        MonthPatientDisbursedCases1 = 0;
      }

      /////////////////////suppplier

      if (countthree[0].Disbursedone[0] != undefined) {
        MonthSupplierDisbursedCases = countthree[0].Disbursedone[0].total;
      } else {
        MonthSupplierDisbursedCases = 0;
      }
      if (countthree[0].Disbursed1[0] != undefined) {
        MonthSupplierDisbursedAmount = countthree[0].Disbursed1[0].total;
      } else {
        MonthSupplierDisbursedAmount = 0;
      }

      // ///////////////////////Invoice

      if (countfour[0].Disbursedone[0] != undefined) {
        MonthInvoiceDisbursedCases = countfour[0].Disbursedone[0].total;
      } else {
        MonthInvoiceDisbursedCases = 0;
      }
      if (countfour[0].Disbursed1[0] != undefined) {
        MonthInvoiceDisbursedAmount = countfour[0].Disbursed1[0].total;
      } else {
        MonthInvoiceDisbursedAmount = 0;
      }

      if (countfour[0].Approved[0] != undefined) {
        MonthInvoiceExpectedAmount = countfour[0].Approved[0].total;
      } else {
        MonthInvoiceExpectedAmount = 0;
      }
      if (countfour[0].Rejectone[0] != undefined) {
        MonthInvoiceActualAmount = countfour[0].Rejectone[0].total;
      } else {
        MonthInvoiceActualAmount = 0;
      }

      var NoOfLeads = MonthMerchantCases + MonthPatientCases;
      var AmountOfLeads = MonthMerchantAmount + MonthPatientAmount;
      var InvoiceApproved =
        MonthPatientDisbursedCases1 + MonthInvoiceExpectedAmount;
      var RejectCount = MonthPatientRejectCases + MonthInvoiceActualAmount;
      var Disbursedcount =
        MonthInvoiceDisbursedCases +
        MonthSupplierDisbursedCases +
        MonthMerchantDisbursedCases;
      var DisbursedAmount =
        MonthInvoiceDisbursedAmount +
        MonthSupplierDisbursedAmount +
        MonthMerchantDisbursedAmount;

      var resgetDashboardForOverviewMonth = {
        data: {
          success: true,
          NoOfLeads: NoOfLeads,
          AmountOfLeads: AmountOfLeads,
          InvoiceApproved: InvoiceApproved,
          RejectCount: RejectCount,
          Disbursedcount: Disbursedcount,
          DisbursedAmount: DisbursedAmount,
        }
      }

      //getDashboardForOverviewHospital
      var forcalc = new Date();
      var thismonth = forcalc.getMonth() + 1;
      var t = forcalc.getFullYear();
      var this1 = new Date(t, thismonth - 1, 1);
      var todaydate = new Date();

      var nums = [];
      var char = [];
      var d = [];
      var totalhos = [];

      var count = await this.InvoiceUser.aggregate([
        {
          $facet: {
            sumone: [
              {
                $match: {
                  $and: [
                    { createdAt: { $gte: this1, $lte: todaydate } },
                    { userType: 2 },
                    { Role: "Hospital" },
                  ],
                },
              },
              { $group: { _id: "$_v", total: { $addToSet: "$_id" } } },
            ],
          },
        },
      ]);
      if (count[0].sumone.length != 0) {
        for (let k = 0; k <= count[0].sumone[0].total.length; k++) {
          let id = count[0].sumone[0].total[k];
          var countser1 = await this.Invoice.aggregate([
            {
              $facet: {
                twoo: [
                  {
                    $match: {
                      $and: [
                        { createdAt: { $gte: this1, $lte: todaydate } },
                        { hospitalId: id },
                      ],
                    },
                  },
                  { $group: { _id: "$hospitalId", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                ],
              },
            },
          ]);
          if (countser1[0].twoo[0]) {
            nums = nums.concat(countser1[0].twoo);
          }
        }
        nums.sort(function (a, b) {
          return b.count - a.count;
        });

        var listToDelete = [null];
        for (var i = 0; i < nums.length; i++) {
          var obj = nums[i];

          if (listToDelete.indexOf(obj._id) !== -1) {
            nums.splice(i, 1);
          }
        }
        if (nums.length != 0) {

          for (let p = 0; p < 5; p++) {
            char = await this.InvoiceUser.find({ _id: nums[p] });
            if (char) {
              d = d.concat(char);
            }
            if (char.length != 0) {
              totalhos = totalhos.concat(d[p].Name);
            }
          }
        }
      }


      var resgetDashboardForOverviewHospital = {
        data: {
          success: true,
          totalhos: totalhos,

        }
      }

      //getDashboardForOverviewAggregator
      var nums = [];
      var char = [];
      var d = [];
      var totalAgg = [];
      var count = await this.InvoiceUser.aggregate([
        {
          $facet: {
            sumone: [
              { $match: { $and: [{ userType: 3 }, { Role: "Aggregator" }] } },
              { $group: { _id: "$_v", total: { $addToSet: "$_id" } } },
            ],
          },
        },
      ]);
      for (let k = 0; k <= count[0].sumone[0].total.length; k++) {
        let id = count[0].sumone[0].total[k];
        var countser1 = await this.InvoiceUser.aggregate([
          {
            $facet: {
              twoo: [
                {
                  $match: {
                    $and: [
                      { userType: 2 },
                      { Role: "Hospital" },
                      { aggregatorId: id },
                    ],
                  },
                },
                { $group: { _id: "$aggregatorId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $skip: 0 },
                { $limit: 4 },
              ],
            },
          },
        ]);
        if (countser1[0].twoo[0]) {
          nums = nums.concat(countser1[0].twoo);
        }
      }
      nums.sort(function (a, b) {
        return b.count - a.count;
      });
      var listToDelete = [null];
      for (var i = 0; i < nums.length; i++) {
        var obj = nums[i];

        if (listToDelete.indexOf(obj._id) !== -1) {
          nums.splice(i, 1);
        }
      }

      for (let l = 0; l < 3; l++) {
        char = await this.InvoiceUser.find({ _id: nums[l] });
        if (char) {
          d = d.concat(char);
        }
        if (char.length != 0) {
          totalAgg = totalAgg.concat(d[l].Name);
        }
      }

      var resgetDashboardForOverviewAggregator = {
        data: {
          success: true,
          totalAgg: totalAgg,
        }
      }

      var overviewdashboard = await this.OverviewAdminDashboardModel.create({
        resgetOverviewDashboard: resgetOverviewDashboard,
        resgetDashboardForBussinessProductWise: resgetDashboardForBussinessProductWise,
        resgetDashboardForMonth: resgetDashboardForMonth,
        resgetDashboardForMonthProductWise: resgetDashboardForMonthProductWise,
        resgetDashboardForOverviewBussiness: resgetDashboardForOverviewBussiness,
        resgetDashboardForOverviewMonth: resgetDashboardForOverviewMonth,
        resgetDashboardForOverviewHospital: resgetDashboardForOverviewHospital,
        resgetDashboardForOverviewAggregator: resgetDashboardForOverviewAggregator,
      });
      return { overviewdashboard };

    } catch (e) {
      this.logger.error(e);
      throw e;
    }

  }

}