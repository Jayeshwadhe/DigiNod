import { Service, Inject } from 'typedi';
import { Request, Response } from 'express';
import moment from 'moment';
@Service()
export default class patientLoanAdminService {
    constructor(
        @Inject('patientLoanModel') private patientLoanModel: Models.patientLoanModel,
        @Inject('patientLoansDashboardModel') private patientLoansDashboardModel: Models.patientLoansDashboardModel,
        @Inject('logger') private logger,
    ) {
    }

    public async getPatientDash(req: Request): Promise<{ data: any }> {
        try {
            const userRecord = await this.patientLoansDashboardModel.find({}).sort({ jobLastUpdatedOn: -1 }).limit(1)
            var data = userRecord
            return { data };
        } catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    public async patientLoanDashJob(req: Request, res: Response): Promise<{ data: any }> {
        try {
          var searchFilters = [];
          searchFilters.push({ isDeleted: false });
    
          // var dateFrom1 = dateFrom.toUTCString();
          // dateFrom = new Date(dateFrom1);
          // var dateTo1 = dateTo.toUTCString();
          // dateTo = new Date(dateTo1);
          if (req.query.dateFrom != undefined || null && req.query.dateTo != undefined || null) {
            searchFilters.push({ createdAt: { $gte: req.query.dateFrom, $lte: req.query.dateTo } });
          }
          var dashboardData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                totalUninsuredCount: [{ $match: { isInsured: false, $and: searchFilters } }, { $count: 'total' }],
                totalReimbursementCount: [{ $match: { isInsured: true, $and: searchFilters } }, { $count: 'total' }],
                totalCount: [{ $match: { $and: searchFilters } }, { $count: 'total' }],
                totalAmount: [
                  { $match: { $and: searchFilters } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                totalUninsuredAmount: [
                  { $match: { isInsured: false, $and: searchFilters } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                totalReimbursementAmount: [
                  { $match: { isInsured: true, $and: searchFilters } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                totalInProcessCount: [
                  {
                    $match: {
                      $and: [
                        { $and: searchFilters },
                        {
                          $or: [
                            { invoiceStatus: 'Pending' },
                            { invoiceStatus: 'InProcess' },
                            { invoiceStatus: 'LApproved' },
                          ],
                        },
                      ],
                    },
                  },
                  { $count: 'total' },
                ],
                uninsuredInProcessCount: [
                  {
                    $match: {
                      $and: [
                        { isInsured: false },
                        { $and: searchFilters },
                        {
                          $or: [
                            { invoiceStatus: 'Pending' },
                            { invoiceStatus: 'InProcess' },
                            { invoiceStatus: 'LApproved' },
                          ],
                        },
                      ],
                    },
                  },
                  { $count: 'total' },
                ],
                reimbursementInProcessCount: [
                  {
                    $match: {
                      $and: [
                        { isInsured: true },
                        { $and: searchFilters },
                        {
                          $or: [
                            { invoiceStatus: 'Pending' },
                            { invoiceStatus: 'InProcess' },
                            { invoiceStatus: 'LApproved' },
                          ],
                        },
                      ],
                    },
                  },
                  { $count: 'total' },
                ],
                totalInProcessAmount: [
                  {
                    $match: {
                      $and: [
                        { $and: searchFilters },
                        {
                          $or: [
                            { invoiceStatus: 'Pending' },
                            { invoiceStatus: 'InProcess' },
                            { invoiceStatus: 'LApproved' },
                          ],
                        },
                      ],
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                uninsuredInProcessAmount: [
                  {
                    $match: {
                      $and: [
                        { isInsured: false },
                        { $and: searchFilters },
                        {
                          $or: [
                            { invoiceStatus: 'Pending' },
                            { invoiceStatus: 'InProcess' },
                            { invoiceStatus: 'LApproved' },
                          ],
                        },
                      ],
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                reimbursementInProcessAmount: [
                  {
                    $match: {
                      $and: [
                        { isInsured: true },
                        { $and: searchFilters },
                        {
                          $or: [
                            { invoiceStatus: 'Pending' },
                            { invoiceStatus: 'InProcess' },
                            { invoiceStatus: 'LApproved' },
                          ],
                        },
                      ],
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                totalFundedCount: [{ $match: { invoiceStatus: 'Funded', $and: searchFilters } }, { $count: 'total' }],
                uninsuredFundedCount: [
                  { $match: { $and: [{ isInsured: false }, { invoiceStatus: 'Funded' }, { $and: searchFilters }] } },
                  { $count: 'total' },
                ],
                reimbursementFundedCount: [
                  { $match: { $and: [{ isInsured: true }, { invoiceStatus: 'Funded' }, { $and: searchFilters }] } },
                  { $count: 'total' },
                ],
                totalFundedAmount: [
                  { $match: { invoiceStatus: 'Funded', $and: searchFilters } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                uninsuredFundedAmount: [
                  { $match: { $and: [{ isInsured: false }, { invoiceStatus: 'Funded' }, { $and: searchFilters }] } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                reimbursementFundedAmount: [
                  { $match: { $and: [{ isInsured: true }, { invoiceStatus: 'Funded' }, { $and: searchFilters }] } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                totalRepaidCount: [{ $match: { invoiceStatus: 'Repaid', $and: searchFilters } }, { $count: 'total' }],
                uninsuredRepaidCount: [
                  { $match: { $and: [{ isInsured: false }, { invoiceStatus: 'Repaid' }, { $and: searchFilters }] } },
                  { $count: 'total' },
                ],
                reimbursementRepaidCount: [
                  { $match: { $and: [{ isInsured: true }, { invoiceStatus: 'Repaid' }, { $and: searchFilters }] } },
                  { $count: 'total' },
                ],
                totalRepaidAmount: [
                  { $match: { invoiceStatus: 'Repaid', $and: searchFilters } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                uninsuredRepaidAmount: [
                  { $match: { $and: [{ isInsured: false }, { invoiceStatus: 'Repaid' }, { $and: searchFilters }] } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                reimbursementRepaidAmount: [
                  { $match: { $and: [{ isInsured: true }, { invoiceStatus: 'Repaid' }, { $and: searchFilters }] } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                totalRejectedCount: [{ $match: { invoiceStatus: 'Rejected', $and: searchFilters } }, { $count: 'total' }],
                uninsuredRejectedCount: [
                  { $match: { $and: [{ isInsured: false }, { invoiceStatus: 'Rejected' }, { $and: searchFilters }] } },
                  { $count: 'total' },
                ],
                reimbursementRejectedCount: [
                  { $match: { $and: [{ isInsured: true }, { invoiceStatus: 'Rejected' }, { $and: searchFilters }] } },
                  { $count: 'total' },
                ],
                totalRejectedAmount: [
                  { $match: { invoiceStatus: 'Rejected', $and: searchFilters } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                uninsuredRejectedAmount: [
                  { $match: { $and: [{ isInsured: false }, { invoiceStatus: 'Rejected' }, { $and: searchFilters }] } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                reimbursementRejectedAmount: [
                  { $match: { $and: [{ isInsured: true }, { invoiceStatus: 'Rejected' }, { $and: searchFilters }] } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
              },
            },
          ]);
    
          var totalUninsuredCount: 0;
          var totalReimbursementCount: 0;
          var totalCount: 0;
          var totalAmount: 0;
          var totalUninsuredAmount: 0;
          var totalReimbursementAmount: 0;
    
          var totalInProcessCount = 0;
          var uninsuredInProcessCount = 0;
          var reimbursementInProcessCount = 0;
    
          var totalInProcessAmount = 0;
          var uninsuredInProcessAmount = 0;
          var reimbursementInProcessAmount = 0;
    
          var totalFundedCount = 0;
          var uninsuredFundedCount = 0;
          var reimbursementFundedCount = 0;
    
          var totalFundedAmount = 0;
          var uninsuredFundedAmount = 0;
          var reimbursementFundedAmount = 0;
    
          var totalRepaidCount = 0;
          var uninsuredRepaidCount = 0;
          var reimbursementRepaidCount = 0;
    
          var totalRepaidAmount = 0;
          var uninsuredRepaidAmount = 0;
          var reimbursementRepaidAmount = 0;
    
          var totalRejectedCount = 0;
          var uninsuredRejectedCount = 0;
          var reimbursementRejectedCount = 0;
    
          var totalRejectedAmount = 0;
          var uninsuredRejectedAmount = 0;
          var reimbursementRejectedAmount = 0;
    
          if (dashboardData[0].totalUninsuredCount[0] != undefined) {
            totalUninsuredCount = dashboardData[0].totalUninsuredCount[0].total;
          } else {
            totalUninsuredCount = 0;
          }
          if (dashboardData[0].totalReimbursementCount[0] != undefined) {
            totalReimbursementCount = dashboardData[0].totalReimbursementCount[0].total;
          } else {
            totalReimbursementCount = 0;
          }
          if (dashboardData[0].totalCount[0] != undefined) {
            totalCount = dashboardData[0].totalCount[0].total;
          } else {
            totalCount = 0;
          }
          if (dashboardData[0].totalAmount[0] != undefined) {
            totalAmount = dashboardData[0].totalAmount[0].total;
          } else {
            totalAmount = 0;
          }
          if (dashboardData[0].totalUninsuredAmount[0] != undefined) {
            totalUninsuredAmount = dashboardData[0].totalUninsuredAmount[0].total;
          } else {
            totalUninsuredAmount = 0;
          }
          if (dashboardData[0].totalReimbursementAmount[0] != undefined) {
            totalReimbursementAmount = dashboardData[0].totalReimbursementAmount[0].total;
          } else {
            totalReimbursementAmount = 0;
          }
    
          if (dashboardData[0].totalInProcessCount[0] != undefined) {
            totalInProcessCount = dashboardData[0].totalInProcessCount[0].total;
          } else {
            totalInProcessCount = 0;
          }
          if (dashboardData[0].uninsuredInProcessCount[0] != undefined) {
            uninsuredInProcessCount = dashboardData[0].uninsuredInProcessCount[0].total;
          } else {
            uninsuredInProcessCount = 0;
          }
          if (dashboardData[0].reimbursementInProcessCount[0] != undefined) {
            reimbursementInProcessCount = dashboardData[0].reimbursementInProcessCount[0].total;
          } else {
            reimbursementInProcessCount = 0;
          }
    
          if (dashboardData[0].totalInProcessAmount[0] != undefined) {
            totalInProcessAmount = dashboardData[0].totalInProcessAmount[0].total;
          } else {
            totalInProcessAmount = 0;
          }
          if (dashboardData[0].uninsuredInProcessAmount[0] != undefined) {
            uninsuredInProcessAmount = dashboardData[0].uninsuredInProcessAmount[0].total;
          } else {
            uninsuredInProcessAmount = 0;
          }
          if (dashboardData[0].reimbursementInProcessAmount[0] != undefined) {
            reimbursementInProcessAmount = dashboardData[0].reimbursementInProcessAmount[0].total;
          } else {
            reimbursementInProcessAmount = 0;
          }
    
          if (dashboardData[0].totalFundedCount[0] != undefined) {
            totalFundedCount = dashboardData[0].totalFundedCount[0].total;
          } else {
            totalFundedCount = 0;
          }
          if (dashboardData[0].uninsuredFundedCount[0] != undefined) {
            uninsuredFundedCount = dashboardData[0].uninsuredFundedCount[0].total;
          } else {
            uninsuredFundedCount = 0;
          }
          if (dashboardData[0].reimbursementFundedCount[0] != undefined) {
            reimbursementFundedCount = dashboardData[0].reimbursementFundedCount[0].total;
          } else {
            reimbursementFundedCount = 0;
          }
    
          if (dashboardData[0].totalFundedAmount[0] != undefined) {
            totalFundedAmount = dashboardData[0].totalFundedAmount[0].total;
          } else {
            totalFundedAmount = 0;
          }
          if (dashboardData[0].uninsuredFundedAmount[0] != undefined) {
            uninsuredFundedAmount = dashboardData[0].uninsuredFundedAmount[0].total;
          } else {
            uninsuredFundedAmount = 0;
          }
          if (dashboardData[0].reimbursementFundedAmount[0] != undefined) {
            reimbursementFundedAmount = dashboardData[0].reimbursementFundedAmount[0].total;
          } else {
            reimbursementFundedAmount = 0;
          }
    
          if (dashboardData[0].totalRepaidCount[0] != undefined) {
            totalRepaidCount = dashboardData[0].totalRepaidCount[0].total;
          } else {
            totalRepaidCount = 0;
          }
          if (dashboardData[0].uninsuredRepaidCount[0] != undefined) {
            uninsuredRepaidCount = dashboardData[0].uninsuredRepaidCount[0].total;
          } else {
            uninsuredRepaidCount = 0;
          }
          if (dashboardData[0].reimbursementRepaidCount[0] != undefined) {
            reimbursementRepaidCount = dashboardData[0].reimbursementRepaidCount[0].total;
          } else {
            reimbursementRepaidCount = 0;
          }
    
          if (dashboardData[0].totalRepaidAmount[0] != undefined) {
            totalRepaidAmount = dashboardData[0].totalRepaidAmount[0].total;
          } else {
            totalRepaidAmount = 0;
          }
          if (dashboardData[0].uninsuredRepaidAmount[0] != undefined) {
            uninsuredRepaidAmount = dashboardData[0].uninsuredRepaidAmount[0].total;
          } else {
            uninsuredRepaidAmount = 0;
          }
          if (dashboardData[0].reimbursementRepaidAmount[0] != undefined) {
            reimbursementRepaidAmount = dashboardData[0].reimbursementRepaidAmount[0].total;
          } else {
            reimbursementRepaidAmount = 0;
          }
    
          if (dashboardData[0].totalRejectedCount[0] != undefined) {
            totalRejectedCount = dashboardData[0].totalRejectedCount[0].total;
          } else {
            totalRejectedCount = 0;
          }
          if (dashboardData[0].uninsuredRejectedCount[0] != undefined) {
            uninsuredRejectedCount = dashboardData[0].uninsuredRejectedCount[0].total;
          } else {
            uninsuredRejectedCount = 0;
          }
          if (dashboardData[0].reimbursementRejectedCount[0] != undefined) {
            reimbursementRejectedCount = dashboardData[0].reimbursementRejectedCount[0].total;
          } else {
            reimbursementRejectedCount = 0;
          }
    
          if (dashboardData[0].totalRejectedAmount[0] != undefined) {
            totalRejectedAmount = dashboardData[0].totalRejectedAmount[0].total;
          } else {
            totalRejectedAmount = 0;
          }
          if (dashboardData[0].uninsuredRejectedAmount[0] != undefined) {
            uninsuredRejectedAmount = dashboardData[0].uninsuredRejectedAmount[0].total;
          } else {
            uninsuredRejectedAmount = 0;
          }
          if (dashboardData[0].reimbursementRejectedAmount[0] != undefined) {
            reimbursementRejectedAmount = dashboardData[0].reimbursementRejectedAmount[0].total;
          } else {
            reimbursementRejectedAmount = 0;
          }
    
          //graphs
          var date = moment.utc();
          var currentMonth = date.month() + 1;
          var currentMonthYear = date.year();
          var previousMonth1 = date.subtract(1, 'month').month() + 1;
          var previousMonthYear1 = date.year();
          var previousMonth2 = date.subtract(1, 'months').month() + 1;
          var previousMonthYear2 = date.year();
          var previousMonth3 = date.subtract(1, 'months').month() + 1;
          var previousMonthYear3 = date.year();
          var previousMonth4 = date.subtract(1, 'months').month() + 1;
          var previousMonthYear4 = date.year();
          var previousMonth5 = date.subtract(1, 'months').month() + 1;
          var previousMonthYear5 = date.year();
    
          //Amount of Uploaded Invoices(Monthly)
    
          var invoiceAmount1 = 0;
          var invoiceAmount2 = 0;
          var invoiceAmount3 = 0;
          var invoiceAmount4 = 0;
          var invoiceAmount5 = 0;
          var invoiceAmount6 = 0;
    
          var invoiceAmountData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                invoiceAmount1: [
                  { $project: { loanAmount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: currentMonth } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                invoiceAmount2: [
                  { $project: { loanAmount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth1 } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                invoiceAmount3: [
                  { $project: { loanAmount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth2 } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                invoiceAmount4: [
                  { $project: { loanAmount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth3 } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                invoiceAmount5: [
                  { $project: { loanAmount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth4 } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                invoiceAmount6: [
                  { $project: { loanAmount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth5 } },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
              },
            },
          ]);
          if (invoiceAmountData[0].invoiceAmount1[0] != undefined) {
            invoiceAmount1 = invoiceAmountData[0].invoiceAmount1[0].total;
          } else {
            invoiceAmount1 = 0;
          }
          if (invoiceAmountData[0].invoiceAmount2[0] != undefined) {
            invoiceAmount2 = invoiceAmountData[0].invoiceAmount2[0].total;
          } else {
            invoiceAmount2 = 0;
          }
          if (invoiceAmountData[0].invoiceAmount3[0] != undefined) {
            invoiceAmount3 = invoiceAmountData[0].invoiceAmount3[0].total;
          } else {
            invoiceAmount3 = 0;
          }
          if (invoiceAmountData[0].invoiceAmount4[0] != undefined) {
            invoiceAmount4 = invoiceAmountData[0].invoiceAmount4[0].total;
          } else {
            invoiceAmount4 = 0;
          }
          if (invoiceAmountData[0].invoiceAmount5[0] != undefined) {
            invoiceAmount4 = invoiceAmountData[0].invoiceAmount5[0].total;
          } else {
            invoiceAmount5 = 0;
          }
          if (invoiceAmountData[0].invoiceAmount6[0] != undefined) {
            invoiceAmount5 = invoiceAmountData[0].invoiceAmount6[0].total;
          } else {
            invoiceAmount6 = 0;
          }
    
          var invoiceAmountGraph = [
            [invoiceAmount1, currentMonth, currentMonthYear],
            [invoiceAmount2, previousMonth1, previousMonthYear1],
            [invoiceAmount3, previousMonth2, previousMonthYear2],
            [invoiceAmount4, previousMonth3, previousMonthYear3],
            [invoiceAmount5, previousMonth4, previousMonthYear4],
            [invoiceAmount6, previousMonth5, previousMonthYear5],
          ];
    
          //Count of Uploaded Invoices(Monthly)
    
          var invoiceCount1 = 0;
          var invoiceCount2 = 0;
          var invoiceCount3 = 0;
          var invoiceCount4 = 0;
          var invoiceCount5 = 0;
          var invoiceCount6 = 0;
    
          var invoiceCountData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                invoiceCount1: [
                  { $project: { loanCount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: currentMonth } },
                  { $count: 'total' },
                ],
                invoiceCount2: [
                  { $project: { loanCount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth1 } },
                  { $count: 'total' },
                ],
                invoiceCount3: [
                  { $project: { loanCount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth2 } },
                  { $count: 'total' },
                ],
                invoiceCount4: [
                  { $project: { loanCount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth3 } },
                  { $count: 'total' },
                ],
                invoiceCount5: [
                  { $project: { loanCount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth4 } },
                  { $count: 'total' },
                ],
                invoiceCount6: [
                  { $project: { loanCount: 1, month: { $month: '$createdAt' } } },
                  { $match: { month: previousMonth5 } },
                  { $count: 'total' },
                ],
              },
            },
          ]);
          if (invoiceCountData[0].invoiceCount1[0] != undefined) {
            invoiceCount1 = invoiceCountData[0].invoiceCount1[0].total;
          } else {
            invoiceCount1 = 0;
          }
          if (invoiceCountData[0].invoiceCount2[0] != undefined) {
            invoiceCount2 = invoiceCountData[0].invoiceCount2[0].total;
          } else {
            invoiceCount2 = 0;
          }
          if (invoiceCountData[0].invoiceCount3[0] != undefined) {
            invoiceCount3 = invoiceCountData[0].invoiceCount3[0].total;
          } else {
            invoiceCount3 = 0;
          }
          if (invoiceCountData[0].invoiceCount4[0] != undefined) {
            invoiceCount4 = invoiceCountData[0].invoiceCount4[0].total;
          } else {
            invoiceCount4 = 0;
          }
          if (invoiceCountData[0].invoiceCount5[0] != undefined) {
            invoiceCount4 = invoiceCountData[0].invoiceCount5[0].total;
          } else {
            invoiceCount5 = 0;
          }
          if (invoiceCountData[0].invoiceCount6[0] != undefined) {
            invoiceCount5 = invoiceCountData[0].invoiceCount6[0].total;
          } else {
            invoiceCount6 = 0;
          }
    
          var invoiceCountGraph = [
            [invoiceCount1, currentMonth, currentMonthYear],
            [invoiceCount2, previousMonth1, previousMonthYear1],
            [invoiceCount3, previousMonth2, previousMonthYear2],
            [invoiceCount4, previousMonth3, previousMonthYear3],
            [invoiceCount5, previousMonth4, previousMonthYear4],
            [invoiceCount6, previousMonth5, previousMonthYear5],
          ];
    
          //Amount of Reimbursement Invoices(Monthly)
    
          var InProcessAmount1 = 0;
          var InProcessAmount2 = 0;
          var InProcessAmount3 = 0;
          var InProcessAmount4 = 0;
          var InProcessAmount5 = 0;
          var InProcessAmount6 = 0;
    
          var fundedAmount1 = 0;
          var fundedAmount2 = 0;
          var fundedAmount3 = 0;
          var fundedAmount4 = 0;
          var fundedAmount5 = 0;
          var fundedAmount6 = 0;
    
          var repaidAmount1 = 0;
          var repaidAmount2 = 0;
          var repaidAmount3 = 0;
          var repaidAmount4 = 0;
          var repaidAmount5 = 0;
          var repaidAmount6 = 0;
    
          var rejectedAmount1 = 0;
          var rejectedAmount2 = 0;
          var rejectedAmount3 = 0;
          var rejectedAmount4 = 0;
          var rejectedAmount5 = 0;
          var rejectedAmount6 = 0;
    
          var invoiceAmountData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                InProcessAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                fundedAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      invoiceStatus: 'funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                repaidAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                rejectedAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
              },
            },
          ]);
          if (invoiceAmountData[0].InProcessAmount1[0] != undefined) {
            InProcessAmount1 = invoiceAmountData[0].InProcessAmount1[0].total;
          } else {
            InProcessAmount1 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount2[0] != undefined) {
            InProcessAmount2 = invoiceAmountData[0].InProcessAmount2[0].total;
          } else {
            InProcessAmount2 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount3[0] != undefined) {
            InProcessAmount3 = invoiceAmountData[0].InProcessAmount3[0].total;
          } else {
            InProcessAmount3 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount4[0] != undefined) {
            InProcessAmount4 = invoiceAmountData[0].InProcessAmount4[0].total;
          } else {
            InProcessAmount4 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount5[0] != undefined) {
            InProcessAmount4 = invoiceAmountData[0].InProcessAmount5[0].total;
          } else {
            InProcessAmount5 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount6[0] != undefined) {
            InProcessAmount5 = invoiceAmountData[0].InProcessAmount6[0].total;
          } else {
            InProcessAmount6 = 0;
          }
    
          if (invoiceAmountData[0].fundedAmount1[0] != undefined) {
            fundedAmount1 = invoiceAmountData[0].fundedAmount1[0].total;
          } else {
            fundedAmount1 = 0;
          }
          if (invoiceAmountData[0].fundedAmount2[0] != undefined) {
            fundedAmount2 = invoiceAmountData[0].fundedAmount2[0].total;
          } else {
            fundedAmount2 = 0;
          }
          if (invoiceAmountData[0].fundedAmount3[0] != undefined) {
            fundedAmount3 = invoiceAmountData[0].fundedAmount3[0].total;
          } else {
            fundedAmount3 = 0;
          }
          if (invoiceAmountData[0].fundedAmount4[0] != undefined) {
            fundedAmount4 = invoiceAmountData[0].fundedAmount4[0].total;
          } else {
            fundedAmount4 = 0;
          }
          if (invoiceAmountData[0].fundedAmount5[0] != undefined) {
            fundedAmount4 = invoiceAmountData[0].fundedAmount5[0].total;
          } else {
            fundedAmount5 = 0;
          }
          if (invoiceAmountData[0].fundedAmount6[0] != undefined) {
            fundedAmount5 = invoiceAmountData[0].fundedAmount6[0].total;
          } else {
            fundedAmount6 = 0;
          }
    
          if (invoiceAmountData[0].repaidAmount1[0] != undefined) {
            repaidAmount1 = invoiceAmountData[0].repaidAmount1[0].total;
          } else {
            repaidAmount1 = 0;
          }
          if (invoiceAmountData[0].repaidAmount2[0] != undefined) {
            repaidAmount2 = invoiceAmountData[0].repaidAmount2[0].total;
          } else {
            repaidAmount2 = 0;
          }
          if (invoiceAmountData[0].repaidAmount3[0] != undefined) {
            repaidAmount3 = invoiceAmountData[0].repaidAmount3[0].total;
          } else {
            repaidAmount3 = 0;
          }
          if (invoiceAmountData[0].repaidAmount4[0] != undefined) {
            repaidAmount4 = invoiceAmountData[0].repaidAmount4[0].total;
          } else {
            repaidAmount4 = 0;
          }
          if (invoiceAmountData[0].repaidAmount5[0] != undefined) {
            repaidAmount4 = invoiceAmountData[0].repaidAmount5[0].total;
          } else {
            repaidAmount5 = 0;
          }
          if (invoiceAmountData[0].repaidAmount6[0] != undefined) {
            repaidAmount5 = invoiceAmountData[0].repaidAmount6[0].total;
          } else {
            repaidAmount6 = 0;
          }
    
          if (invoiceAmountData[0].rejectedAmount1[0] != undefined) {
            rejectedAmount1 = invoiceAmountData[0].rejectedAmount1[0].total;
          } else {
            rejectedAmount1 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount2[0] != undefined) {
            rejectedAmount2 = invoiceAmountData[0].rejectedAmount2[0].total;
          } else {
            rejectedAmount2 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount3[0] != undefined) {
            rejectedAmount3 = invoiceAmountData[0].rejectedAmount3[0].total;
          } else {
            rejectedAmount3 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount4[0] != undefined) {
            rejectedAmount4 = invoiceAmountData[0].rejectedAmount4[0].total;
          } else {
            rejectedAmount4 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount5[0] != undefined) {
            rejectedAmount4 = invoiceAmountData[0].rejectedAmount5[0].total;
          } else {
            rejectedAmount5 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount6[0] != undefined) {
            rejectedAmount5 = invoiceAmountData[0].rejectedAmount6[0].total;
          } else {
            rejectedAmount6 = 0;
          }
    
          var InProcessAmountGraph = [
            [InProcessAmount1, currentMonth, currentMonthYear],
            [InProcessAmount2, previousMonth1, previousMonthYear1],
            [InProcessAmount3, previousMonth2, previousMonthYear2],
            [InProcessAmount4, previousMonth3, previousMonthYear3],
            [InProcessAmount5, previousMonth4, previousMonthYear4],
            [InProcessAmount6, previousMonth5, previousMonthYear5],
          ];
          var fundedAmountGraph = [
            [fundedAmount1, currentMonth, currentMonthYear],
            [fundedAmount2, previousMonth1, previousMonthYear1],
            [fundedAmount3, previousMonth2, previousMonthYear2],
            [fundedAmount4, previousMonth3, previousMonthYear3],
            [fundedAmount5, previousMonth4, previousMonthYear4],
            [fundedAmount6, previousMonth5, previousMonthYear5],
          ];
          var repaidAmountGraph = [
            [repaidAmount1, currentMonth, currentMonthYear],
            [repaidAmount2, previousMonth1, previousMonthYear1],
            [repaidAmount3, previousMonth2, previousMonthYear2],
            [repaidAmount4, previousMonth3, previousMonthYear3],
            [repaidAmount5, previousMonth4, previousMonthYear4],
            [repaidAmount6, previousMonth5, previousMonthYear5],
          ];
          var rejectedAmountGraph = [
            [rejectedAmount1, currentMonth, currentMonthYear],
            [rejectedAmount2, previousMonth1, previousMonthYear1],
            [rejectedAmount3, previousMonth2, previousMonthYear2],
            [rejectedAmount4, previousMonth3, previousMonthYear3],
            [rejectedAmount5, previousMonth4, previousMonthYear4],
            [rejectedAmount6, previousMonth5, previousMonthYear5],
          ];
    
          //Count of Reimbursement Invoices(Monthly)
    
          var InProcessCount1 = 0;
          var InProcessCount2 = 0;
          var InProcessCount3 = 0;
          var InProcessCount4 = 0;
          var InProcessCount5 = 0;
          var InProcessCount6 = 0;
    
          var fundedCount1 = 0;
          var fundedCount2 = 0;
          var fundedCount3 = 0;
          var fundedCount4 = 0;
          var fundedCount5 = 0;
          var fundedCount6 = 0;
    
          var repaidCount1 = 0;
          var repaidCount2 = 0;
          var repaidCount3 = 0;
          var repaidCount4 = 0;
          var repaidCount5 = 0;
          var repaidCount6 = 0;
    
          var rejectedCount1 = 0;
          var rejectedCount2 = 0;
          var rejectedCount3 = 0;
          var rejectedCount4 = 0;
          var rejectedCount5 = 0;
          var rejectedCount6 = 0;
    
          var invoiceCountData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                InProcessCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
    
                fundedCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      invoiceStatus: 'funded',
                    },
                  },
                  { $count: 'total' },
                ],
    
                repaidCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
    
                rejectedCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: false,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
              },
            },
          ]);
          if (invoiceCountData[0].InProcessCount1[0] != undefined) {
            InProcessCount1 = invoiceCountData[0].InProcessCount1[0].total;
          } else {
            InProcessCount1 = 0;
          }
          if (invoiceCountData[0].InProcessCount2[0] != undefined) {
            InProcessCount2 = invoiceCountData[0].InProcessCount2[0].total;
          } else {
            InProcessCount2 = 0;
          }
          if (invoiceCountData[0].InProcessCount3[0] != undefined) {
            InProcessCount3 = invoiceCountData[0].InProcessCount3[0].total;
          } else {
            InProcessCount3 = 0;
          }
          if (invoiceCountData[0].InProcessCount4[0] != undefined) {
            InProcessCount4 = invoiceCountData[0].InProcessCount4[0].total;
          } else {
            InProcessCount4 = 0;
          }
          if (invoiceCountData[0].InProcessCount5[0] != undefined) {
            InProcessCount4 = invoiceCountData[0].InProcessCount5[0].total;
          } else {
            InProcessCount5 = 0;
          }
          if (invoiceCountData[0].InProcessCount6[0] != undefined) {
            InProcessCount5 = invoiceCountData[0].InProcessCount6[0].total;
          } else {
            InProcessCount6 = 0;
          }
    
          if (invoiceCountData[0].fundedCount1[0] != undefined) {
            fundedCount1 = invoiceCountData[0].fundedCount1[0].total;
          } else {
            fundedCount1 = 0;
          }
          if (invoiceCountData[0].fundedCount2[0] != undefined) {
            fundedCount2 = invoiceCountData[0].fundedCount2[0].total;
          } else {
            fundedCount2 = 0;
          }
          if (invoiceCountData[0].fundedCount3[0] != undefined) {
            fundedCount3 = invoiceCountData[0].fundedCount3[0].total;
          } else {
            fundedCount3 = 0;
          }
          if (invoiceCountData[0].fundedCount4[0] != undefined) {
            fundedCount4 = invoiceCountData[0].fundedCount4[0].total;
          } else {
            fundedCount4 = 0;
          }
          if (invoiceCountData[0].fundedCount5[0] != undefined) {
            fundedCount4 = invoiceCountData[0].fundedCount5[0].total;
          } else {
            fundedCount5 = 0;
          }
          if (invoiceCountData[0].fundedCount6[0] != undefined) {
            fundedCount5 = invoiceCountData[0].fundedCount6[0].total;
          } else {
            fundedCount6 = 0;
          }
    
          if (invoiceCountData[0].repaidCount1[0] != undefined) {
            repaidCount1 = invoiceCountData[0].repaidCount1[0].total;
          } else {
            repaidCount1 = 0;
          }
          if (invoiceCountData[0].repaidCount2[0] != undefined) {
            repaidCount2 = invoiceCountData[0].repaidCount2[0].total;
          } else {
            repaidCount2 = 0;
          }
          if (invoiceCountData[0].repaidCount3[0] != undefined) {
            repaidCount3 = invoiceCountData[0].repaidCount3[0].total;
          } else {
            repaidCount3 = 0;
          }
          if (invoiceCountData[0].repaidCount4[0] != undefined) {
            repaidCount4 = invoiceCountData[0].repaidCount4[0].total;
          } else {
            repaidCount4 = 0;
          }
          if (invoiceCountData[0].repaidCount5[0] != undefined) {
            repaidCount4 = invoiceCountData[0].repaidCount5[0].total;
          } else {
            repaidCount5 = 0;
          }
          if (invoiceCountData[0].repaidCount6[0] != undefined) {
            repaidCount5 = invoiceCountData[0].repaidCount6[0].total;
          } else {
            repaidCount6 = 0;
          }
    
          if (invoiceCountData[0].rejectedCount1[0] != undefined) {
            rejectedCount1 = invoiceCountData[0].rejectedCount1[0].total;
          } else {
            rejectedCount1 = 0;
          }
          if (invoiceCountData[0].rejectedCount2[0] != undefined) {
            rejectedCount2 = invoiceCountData[0].rejectedCount2[0].total;
          } else {
            rejectedCount2 = 0;
          }
          if (invoiceCountData[0].rejectedCount3[0] != undefined) {
            rejectedCount3 = invoiceCountData[0].rejectedCount3[0].total;
          } else {
            rejectedCount3 = 0;
          }
          if (invoiceCountData[0].rejectedCount4[0] != undefined) {
            rejectedCount4 = invoiceCountData[0].rejectedCount4[0].total;
          } else {
            rejectedCount4 = 0;
          }
          if (invoiceCountData[0].rejectedCount5[0] != undefined) {
            rejectedCount4 = invoiceCountData[0].rejectedCount5[0].total;
          } else {
            rejectedCount5 = 0;
          }
          if (invoiceCountData[0].rejectedCount6[0] != undefined) {
            rejectedCount5 = invoiceCountData[0].rejectedCount6[0].total;
          } else {
            rejectedCount6 = 0;
          }
    
          var InProcessCountGraph = [
            [InProcessCount1, currentMonth, currentMonthYear],
            [InProcessCount2, previousMonth1, previousMonthYear1],
            [InProcessCount3, previousMonth2, previousMonthYear2],
            [InProcessCount4, previousMonth3, previousMonthYear3],
            [InProcessCount5, previousMonth4, previousMonthYear4],
            [InProcessCount6, previousMonth5, previousMonthYear5],
          ];
          var fundedCountGraph = [
            [fundedCount1, currentMonth, currentMonthYear],
            [fundedCount2, previousMonth1, previousMonthYear1],
            [fundedCount3, previousMonth2, previousMonthYear2],
            [fundedCount4, previousMonth3, previousMonthYear3],
            [fundedCount5, previousMonth4, previousMonthYear4],
            [fundedCount6, previousMonth5, previousMonthYear5],
          ];
          var repaidCountGraph = [
            [repaidCount1, currentMonth, currentMonthYear],
            [repaidCount2, previousMonth1, previousMonthYear1],
            [repaidCount3, previousMonth2, previousMonthYear2],
            [repaidCount4, previousMonth3, previousMonthYear3],
            [repaidCount5, previousMonth4, previousMonthYear4],
            [repaidCount6, previousMonth5, previousMonthYear5],
          ];
          var rejectedCountGraph = [
            [rejectedCount1, currentMonth, currentMonthYear],
            [rejectedCount2, previousMonth1, previousMonthYear1],
            [rejectedCount3, previousMonth2, previousMonthYear2],
            [rejectedCount4, previousMonth3, previousMonthYear3],
            [rejectedCount5, previousMonth4, previousMonthYear4],
            [rejectedCount6, previousMonth5, previousMonthYear5],
          ];
    
          //Amount of Uninsured Invoices(Monthly)
    
          var InProcessAmount1 = 0;
          var InProcessAmount2 = 0;
          var InProcessAmount3 = 0;
          var InProcessAmount4 = 0;
          var InProcessAmount5 = 0;
          var InProcessAmount6 = 0;
    
          var fundedAmount1 = 0;
          var fundedAmount2 = 0;
          var fundedAmount3 = 0;
          var fundedAmount4 = 0;
          var fundedAmount5 = 0;
          var fundedAmount6 = 0;
    
          var repaidAmount1 = 0;
          var repaidAmount2 = 0;
          var repaidAmount3 = 0;
          var repaidAmount4 = 0;
          var repaidAmount5 = 0;
          var repaidAmount6 = 0;
    
          var rejectedAmount1 = 0;
          var rejectedAmount2 = 0;
          var rejectedAmount3 = 0;
          var rejectedAmount4 = 0;
          var rejectedAmount5 = 0;
          var rejectedAmount6 = 0;
    
          var invoiceAmountData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                InProcessAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                InProcessAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                fundedAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                fundedAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      invoiceStatus: 'funded',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                repaidAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                repaidAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
    
                rejectedAmount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
                rejectedAmount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $group: { _id: '$_v', total: { $sum: '$loanAmount' } } },
                ],
              },
            },
          ]);
          if (invoiceAmountData[0].InProcessAmount1[0] != undefined) {
            InProcessAmount1 = invoiceAmountData[0].InProcessAmount1[0].total;
          } else {
            InProcessAmount1 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount2[0] != undefined) {
            InProcessAmount2 = invoiceAmountData[0].InProcessAmount2[0].total;
          } else {
            InProcessAmount2 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount3[0] != undefined) {
            InProcessAmount3 = invoiceAmountData[0].InProcessAmount3[0].total;
          } else {
            InProcessAmount3 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount4[0] != undefined) {
            InProcessAmount4 = invoiceAmountData[0].InProcessAmount4[0].total;
          } else {
            InProcessAmount4 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount5[0] != undefined) {
            InProcessAmount4 = invoiceAmountData[0].InProcessAmount5[0].total;
          } else {
            InProcessAmount5 = 0;
          }
          if (invoiceAmountData[0].InProcessAmount6[0] != undefined) {
            InProcessAmount5 = invoiceAmountData[0].InProcessAmount6[0].total;
          } else {
            InProcessAmount6 = 0;
          }
    
          if (invoiceAmountData[0].fundedAmount1[0] != undefined) {
            fundedAmount1 = invoiceAmountData[0].fundedAmount1[0].total;
          } else {
            fundedAmount1 = 0;
          }
          if (invoiceAmountData[0].fundedAmount2[0] != undefined) {
            fundedAmount2 = invoiceAmountData[0].fundedAmount2[0].total;
          } else {
            fundedAmount2 = 0;
          }
          if (invoiceAmountData[0].fundedAmount3[0] != undefined) {
            fundedAmount3 = invoiceAmountData[0].fundedAmount3[0].total;
          } else {
            fundedAmount3 = 0;
          }
          if (invoiceAmountData[0].fundedAmount4[0] != undefined) {
            fundedAmount4 = invoiceAmountData[0].fundedAmount4[0].total;
          } else {
            fundedAmount4 = 0;
          }
          if (invoiceAmountData[0].fundedAmount5[0] != undefined) {
            fundedAmount4 = invoiceAmountData[0].fundedAmount5[0].total;
          } else {
            fundedAmount5 = 0;
          }
          if (invoiceAmountData[0].fundedAmount6[0] != undefined) {
            fundedAmount5 = invoiceAmountData[0].fundedAmount6[0].total;
          } else {
            fundedAmount6 = 0;
          }
    
          if (invoiceAmountData[0].repaidAmount1[0] != undefined) {
            repaidAmount1 = invoiceAmountData[0].repaidAmount1[0].total;
          } else {
            repaidAmount1 = 0;
          }
          if (invoiceAmountData[0].repaidAmount2[0] != undefined) {
            repaidAmount2 = invoiceAmountData[0].repaidAmount2[0].total;
          } else {
            repaidAmount2 = 0;
          }
          if (invoiceAmountData[0].repaidAmount3[0] != undefined) {
            repaidAmount3 = invoiceAmountData[0].repaidAmount3[0].total;
          } else {
            repaidAmount3 = 0;
          }
          if (invoiceAmountData[0].repaidAmount4[0] != undefined) {
            repaidAmount4 = invoiceAmountData[0].repaidAmount4[0].total;
          } else {
            repaidAmount4 = 0;
          }
          if (invoiceAmountData[0].repaidAmount5[0] != undefined) {
            repaidAmount4 = invoiceAmountData[0].repaidAmount5[0].total;
          } else {
            repaidAmount5 = 0;
          }
          if (invoiceAmountData[0].repaidAmount6[0] != undefined) {
            repaidAmount5 = invoiceAmountData[0].repaidAmount6[0].total;
          } else {
            repaidAmount6 = 0;
          }
    
          if (invoiceAmountData[0].rejectedAmount1[0] != undefined) {
            rejectedAmount1 = invoiceAmountData[0].rejectedAmount1[0].total;
          } else {
            rejectedAmount1 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount2[0] != undefined) {
            rejectedAmount2 = invoiceAmountData[0].rejectedAmount2[0].total;
          } else {
            rejectedAmount2 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount3[0] != undefined) {
            rejectedAmount3 = invoiceAmountData[0].rejectedAmount3[0].total;
          } else {
            rejectedAmount3 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount4[0] != undefined) {
            rejectedAmount4 = invoiceAmountData[0].rejectedAmount4[0].total;
          } else {
            rejectedAmount4 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount5[0] != undefined) {
            rejectedAmount4 = invoiceAmountData[0].rejectedAmount5[0].total;
          } else {
            rejectedAmount5 = 0;
          }
          if (invoiceAmountData[0].rejectedAmount6[0] != undefined) {
            rejectedAmount5 = invoiceAmountData[0].rejectedAmount6[0].total;
          } else {
            rejectedAmount6 = 0;
          }
    
          var InProcessAmount = [
            [InProcessAmount1, currentMonth, currentMonthYear],
            [InProcessAmount2, previousMonth1, previousMonthYear1],
            [InProcessAmount3, previousMonth2, previousMonthYear2],
            [InProcessAmount4, previousMonth3, previousMonthYear3],
            [InProcessAmount5, previousMonth4, previousMonthYear4],
            [InProcessAmount6, previousMonth5, previousMonthYear5],
          ];
          var fundedAmount = [
            [fundedAmount1, currentMonth, currentMonthYear],
            [fundedAmount2, previousMonth1, previousMonthYear1],
            [fundedAmount3, previousMonth2, previousMonthYear2],
            [fundedAmount4, previousMonth3, previousMonthYear3],
            [fundedAmount5, previousMonth4, previousMonthYear4],
            [fundedAmount6, previousMonth5, previousMonthYear5],
          ];
          var repaidAmount = [
            [repaidAmount1, currentMonth, currentMonthYear],
            [repaidAmount2, previousMonth1, previousMonthYear1],
            [repaidAmount3, previousMonth2, previousMonthYear2],
            [repaidAmount4, previousMonth3, previousMonthYear3],
            [repaidAmount5, previousMonth4, previousMonthYear4],
            [repaidAmount6, previousMonth5, previousMonthYear5],
          ];
          var rejectedAmount = [
            [rejectedAmount1, currentMonth, currentMonthYear],
            [rejectedAmount2, previousMonth1, previousMonthYear1],
            [rejectedAmount3, previousMonth2, previousMonthYear2],
            [rejectedAmount4, previousMonth3, previousMonthYear3],
            [rejectedAmount5, previousMonth4, previousMonthYear4],
            [rejectedAmount6, previousMonth5, previousMonthYear5],
          ];
    
          //Count of UnInsured Invoices(Monthly)
    
          var InProcessCount1 = 0;
          var InProcessCount2 = 0;
          var InProcessCount3 = 0;
          var InProcessCount4 = 0;
          var InProcessCount5 = 0;
          var InProcessCount6 = 0;
    
          var fundedCount1 = 0;
          var fundedCount2 = 0;
          var fundedCount3 = 0;
          var fundedCount4 = 0;
          var fundedCount5 = 0;
          var fundedCount6 = 0;
    
          var repaidCount1 = 0;
          var repaidCount2 = 0;
          var repaidCount3 = 0;
          var repaidCount4 = 0;
          var repaidCount5 = 0;
          var repaidCount6 = 0;
    
          var rejectedCount1 = 0;
          var rejectedCount2 = 0;
          var rejectedCount3 = 0;
          var rejectedCount4 = 0;
          var rejectedCount5 = 0;
          var rejectedCount6 = 0;
    
          var invoiceCountData = await this.patientLoanModel.aggregate([
            {
              $facet: {
                InProcessCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
                InProcessCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      $or: [
                        {invoiceStatus: 'InProcess'}, {invoiceStatus: 'Pending'}
                      ]
                    },
                  },
                  { $count: 'total' },
                ],
    
                fundedCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      invoiceStatus: 'Funded',
                    },
                  },
                  { $count: 'total' },
                ],
                fundedCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      invoiceStatus: 'funded',
                    },
                  },
                  { $count: 'total' },
                ],
    
                repaidCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
                repaidCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      invoiceStatus: 'Repaid',
                    },
                  },
                  { $count: 'total' },
                ],
    
                rejectedCount1: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: currentMonth,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount2: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth1,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount3: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth2,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount4: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth3,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount5: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth4,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
                rejectedCount6: [
                  {
                    $project: {
                      invoiceStatus: 1,
                      isInsured: 1,
                      loanAmount: 1,
                      month: { $month: '$createdAt' },
                    },
                  },
                  {
                    $match: {
                      month: previousMonth5,
                      isInsured: true,
                      invoiceStatus: 'Rejected',
                    },
                  },
                  { $count: 'total' },
                ],
              },
            },
          ]);
          if (invoiceCountData[0].InProcessCount1[0] != undefined) {
            InProcessCount1 = invoiceCountData[0].InProcessCount1[0].total;
          } else {
            InProcessCount1 = 0;
          }
          if (invoiceCountData[0].InProcessCount2[0] != undefined) {
            InProcessCount2 = invoiceCountData[0].InProcessCount2[0].total;
          } else {
            InProcessCount2 = 0;
          }
          if (invoiceCountData[0].InProcessCount3[0] != undefined) {
            InProcessCount3 = invoiceCountData[0].InProcessCount3[0].total;
          } else {
            InProcessCount3 = 0;
          }
          if (invoiceCountData[0].InProcessCount4[0] != undefined) {
            InProcessCount4 = invoiceCountData[0].InProcessCount4[0].total;
          } else {
            InProcessCount4 = 0;
          }
          if (invoiceCountData[0].InProcessCount5[0] != undefined) {
            InProcessCount4 = invoiceCountData[0].InProcessCount5[0].total;
          } else {
            InProcessCount5 = 0;
          }
          if (invoiceCountData[0].InProcessCount6[0] != undefined) {
            InProcessCount5 = invoiceCountData[0].InProcessCount6[0].total;
          } else {
            InProcessCount6 = 0;
          }
    
          if (invoiceCountData[0].fundedCount1[0] != undefined) {
            fundedCount1 = invoiceCountData[0].fundedCount1[0].total;
          } else {
            fundedCount1 = 0;
          }
          if (invoiceCountData[0].fundedCount2[0] != undefined) {
            fundedCount2 = invoiceCountData[0].fundedCount2[0].total;
          } else {
            fundedCount2 = 0;
          }
          if (invoiceCountData[0].fundedCount3[0] != undefined) {
            fundedCount3 = invoiceCountData[0].fundedCount3[0].total;
          } else {
            fundedCount3 = 0;
          }
          if (invoiceCountData[0].fundedCount4[0] != undefined) {
            fundedCount4 = invoiceCountData[0].fundedCount4[0].total;
          } else {
            fundedCount4 = 0;
          }
          if (invoiceCountData[0].fundedCount5[0] != undefined) {
            fundedCount4 = invoiceCountData[0].fundedCount5[0].total;
          } else {
            fundedCount5 = 0;
          }
          if (invoiceCountData[0].fundedCount6[0] != undefined) {
            fundedCount5 = invoiceCountData[0].fundedCount6[0].total;
          } else {
            fundedCount6 = 0;
          }
    
          if (invoiceCountData[0].repaidCount1[0] != undefined) {
            repaidCount1 = invoiceCountData[0].repaidCount1[0].total;
          } else {
            repaidCount1 = 0;
          }
          if (invoiceCountData[0].repaidCount2[0] != undefined) {
            repaidCount2 = invoiceCountData[0].repaidCount2[0].total;
          } else {
            repaidCount2 = 0;
          }
          if (invoiceCountData[0].repaidCount3[0] != undefined) {
            repaidCount3 = invoiceCountData[0].repaidCount3[0].total;
          } else {
            repaidCount3 = 0;
          }
          if (invoiceCountData[0].repaidCount4[0] != undefined) {
            repaidCount4 = invoiceCountData[0].repaidCount4[0].total;
          } else {
            repaidCount4 = 0;
          }
          if (invoiceCountData[0].repaidCount5[0] != undefined) {
            repaidCount4 = invoiceCountData[0].repaidCount5[0].total;
          } else {
            repaidCount5 = 0;
          }
          if (invoiceCountData[0].repaidCount6[0] != undefined) {
            repaidCount5 = invoiceCountData[0].repaidCount6[0].total;
          } else {
            repaidCount6 = 0;
          }
    
          if (invoiceCountData[0].rejectedCount1[0] != undefined) {
            rejectedCount1 = invoiceCountData[0].rejectedCount1[0].total;
          } else {
            rejectedCount1 = 0;
          }
          if (invoiceCountData[0].rejectedCount2[0] != undefined) {
            rejectedCount2 = invoiceCountData[0].rejectedCount2[0].total;
          } else {
            rejectedCount2 = 0;
          }
          if (invoiceCountData[0].rejectedCount3[0] != undefined) {
            rejectedCount3 = invoiceCountData[0].rejectedCount3[0].total;
          } else {
            rejectedCount3 = 0;
          }
          if (invoiceCountData[0].rejectedCount4[0] != undefined) {
            rejectedCount4 = invoiceCountData[0].rejectedCount4[0].total;
          } else {
            rejectedCount4 = 0;
          }
          if (invoiceCountData[0].rejectedCount5[0] != undefined) {
            rejectedCount4 = invoiceCountData[0].rejectedCount5[0].total;
          } else {
            rejectedCount5 = 0;
          }
          if (invoiceCountData[0].rejectedCount6[0] != undefined) {
            rejectedCount5 = invoiceCountData[0].rejectedCount6[0].total;
          } else {
            rejectedCount6 = 0;
          }
    
          var InProcessCount = [
            [InProcessCount1, currentMonth, currentMonthYear],
            [InProcessCount2, previousMonth1, previousMonthYear1],
            [InProcessCount3, previousMonth2, previousMonthYear2],
            [InProcessCount4, previousMonth3, previousMonthYear3],
            [InProcessCount5, previousMonth4, previousMonthYear4],
            [InProcessCount6, previousMonth5, previousMonthYear5],
          ];
          var fundedCount = [
            [fundedCount1, currentMonth, currentMonthYear],
            [fundedCount2, previousMonth1, previousMonthYear1],
            [fundedCount3, previousMonth2, previousMonthYear2],
            [fundedCount4, previousMonth3, previousMonthYear3],
            [fundedCount5, previousMonth4, previousMonthYear4],
            [fundedCount6, previousMonth5, previousMonthYear5],
          ];
          var repaidCount = [
            [repaidCount1, currentMonth, currentMonthYear],
            [repaidCount2, previousMonth1, previousMonthYear1],
            [repaidCount3, previousMonth2, previousMonthYear2],
            [repaidCount4, previousMonth3, previousMonthYear3],
            [repaidCount5, previousMonth4, previousMonthYear4],
            [repaidCount6, previousMonth5, previousMonthYear5],
          ];
          var rejectedCount = [
            [rejectedCount1, currentMonth, currentMonthYear],
            [rejectedCount2, previousMonth1, previousMonthYear1],
            [rejectedCount3, previousMonth2, previousMonthYear2],
            [rejectedCount4, previousMonth3, previousMonthYear3],
            [rejectedCount5, previousMonth4, previousMonthYear4],
            [rejectedCount6, previousMonth5, previousMonthYear5],
          ];
    
          //  await this.patientLoansDashboardModel.create()
          var data = {

            totalUninsuredCount: totalUninsuredCount,
            totalReimbursementCount: totalReimbursementCount,
            totalCount: totalCount,
            totalAmount: totalAmount,
            totalUninsuredAmount: totalUninsuredAmount,
            totalReimbursementAmount: totalReimbursementAmount,
    
            totalInProcessCount: totalInProcessCount,
            uninsuredInProcessCount: uninsuredInProcessCount,
            reimbursementInProcessCount: reimbursementInProcessCount,
    
            totalInProcessAmount: totalInProcessAmount,
            uninsuredInProcessAmount: uninsuredInProcessAmount,
            reimbursementInProcessAmount: reimbursementInProcessAmount,
    
            totalFundedCount: totalFundedCount,
            uninsuredFundedCount: uninsuredFundedCount,
            reimbursementFundedCount: reimbursementFundedCount,
    
            totalFundedAmount: totalFundedAmount,
            uninsuredFundedAmount: uninsuredFundedAmount,
            reimbursementFundedAmount: reimbursementFundedAmount,
    
            totalRepaidCount: totalRepaidCount,
            uninsuredRepaidCount: uninsuredRepaidCount,
            reimbursementRepaidCount: reimbursementRepaidCount,
    
            totalRepaidAmount: totalRepaidAmount,
            uninsuredRepaidAmount: uninsuredRepaidAmount,
            reimbursementRepaidAmount: reimbursementRepaidAmount,
    
            totalRejectedCount: totalRejectedCount,
            uninsuredRejectedCount: uninsuredRejectedCount,
            reimbursementRejectedCount: reimbursementRejectedCount,
    
            totalRejectedAmount: totalRejectedAmount,
            uninsuredRejectedAmount: uninsuredRejectedAmount,
            reimbursementRejectedAmount: reimbursementRejectedAmount,
    
            invoiceAmountGraph: invoiceAmountGraph,
            invoiceCountGraph: invoiceCountGraph,
    
            unInsuredAmountGraph: {
              InProcessAmount: InProcessAmountGraph,
              fundedAmount: fundedAmountGraph,
              repaidAmount: repaidAmountGraph,
              rejectedAmount: rejectedAmountGraph,
            },
            unInsuredCountGraph: {
              InProcessCount: InProcessCountGraph,
              fundedCount: fundedCountGraph,
              repaidCount: repaidCountGraph,
              rejectedCount: rejectedCountGraph,
            },
            reimbursementAmountGraph: {
              InProcessAmountGraph: InProcessAmount,
              fundedAmountGraph: fundedAmount,
              repaidAmountGraph: repaidAmount,
              rejectedAmountGraph: rejectedAmount,
            },
            reimbursementCountGraph: {
              InProcessCountGraph: InProcessCount,
              fundedCountGraph: fundedCount,
              repaidCountGraph: repaidCount,
              rejectedCountGraph: rejectedCount,
            },
            
            jobLastUpdatedOn: new Date().toUTCString()
          };
          return { data };
        } catch (e) {
          this.logger.error(e);
          throw e;
        }
      }
}