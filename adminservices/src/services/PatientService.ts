import { Service, Inject } from 'typedi';
import { Request } from 'express';
import moment from 'moment';

const Users = require('../models/PatientUser');

@Service()
export default class patientService {
    constructor(
        @Inject('PatientAdminDashboard') private PatientAdminDashboardModel: Models.PatientAdminDashboardModel,
        @Inject('logger') private logger,){}
    
        public async getPatientData(req: Request): Promise<{ patientDataDashboard: any }> {
            try{
                // from Patient_Users table
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
                    "sum2": [{ $match: { $or: [{ Status: "NICT to work on" }, { Status: "LL is working" }, { Status: "Not Interested" }, { Status: "Yet to disburse" }, ], }, }, { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },],
                    "sumtwo": [{ $match: { $or: [{ Status: "NICT to work on" }, { Status: "LL is working" }, { Status: "Not Interested" }, { Status: "Yet to disburse" }, ], }, }, { $count: "total" },],
                }
            }])

            if (countone[0].sumone[0] != undefined) { Totalinvoices = countone[0].sumone[0].total; } else { Totalinvoices = 0; }
            if (countone[0].sum1[0] != undefined) { TotalClaimsUploaded = countone[0].sum1[0].total; } else { TotalClaimsUploaded = 0; }
            if (countone[0].sumthree[0] != undefined) { TotalRejectedinvoices = countone[0].sumthree[0].total; } else { TotalRejectedinvoices = 0; }
            if (countone[0].sumfour[0] != undefined) { TotalDisbursedInvoice = countone[0].sumfour[0].total; } else { TotalDisbursedInvoice = 0; }
            if (countone[0].sumfive[0] != undefined) { repaidLenth = countone[0].sumfive[0].total; } else { repaidLenth = 0; }
            if (countone[0].sum2[0] != undefined) { TotalLoansInProcess = countone[0].sum2[0].total;} else { TotalLoansInProcess = 0; }
            if (countone[0].sumtwo[0] != undefined) { Totalpendinginvoices = countone[0].sumtwo[0].total; } else { Totalpendinginvoices = 0; }

            var invoices = await this.PatientAdminDashboardModel.find({}).distinct('PartnerName');
                var invoice = invoices.length;
                var AverageTicketSize = TotalClaimsUploaded-Totalinvoices

                var resPatientDashboard = {
                    success: true,
                    TotalUploadedInvoices: Totalinvoices,
                    TotalUploadedInvoicesLoanAmount: TotalClaimsUploaded,
                    TotalRejectedInvoices: TotalRejectedinvoices,
                    TotalDisbursedInvoice: TotalDisbursedInvoice,
                    Aggregator: TotalNumberOfAggregator,
                    AverageTicketSize:AverageTicketSize,
                    LoanInProcess: Totalpendinginvoices,
                    LoanInProcessAmount: TotalLoansInProcess,
                }

            // graphs data
            var date = moment.utc();
            var currentMonth = date.month() + 1; var currentMonthYear = date.year();
            var previousMonth1 = date.subtract(1, "month").month() + 1; var previousMonthYear1 = date.year();
            var previousMonth2 = date.subtract(1, "months").month() + 1; var previousMonthYear2 = date.year();
            var previousMonth3 = date.subtract(1, "months").month() + 1; var previousMonthYear3 = date.year();
            var previousMonth4 = date.subtract(1, "months").month() + 1; var previousMonthYear4 = date.year();
            var previousMonth5 = date.subtract(1, "months").month() + 1; var previousMonthYear5 = date.year();


            // disbursed Graph Data
            var disbursedAmountOne = 0;
            var disbursedAmountTwo = 0;
            var disbursedAmountThree = 0;
            var disbursedAmountFour = 0;
            var disbursedAmountFive = 0;
            var disbursedAmountSix = 0;

            var disburseAmountData = await this.PatientAdminDashboardModel.aggregate([{
                $facet: {
                    "disbursedAmount1": [
                        { $project: { month: { $month: '$updatedAt' } } },
                        { $match: { month: currentMonth } },
                        { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                    ],
                    "disbursedAmount2": [
                        { $project: { month: { $month: '$updatedAt' } } },
                        { $match: { month: previousMonth1 } },
                        { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                    ],
                    "disbursedAmount3": [
                        { $project: { month: { $month: '$updatedAt' } } },
                        { $match: { month: previousMonth2 } },
                        { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                    ],
                    "disbursedAmount4": [
                        { $project: { month: { $month: '$updatedAt' } } },
                        { $match: { month: previousMonth3 } },
                        { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                    ],
                    "disbursedAmount5": [
                        { $project: { month: { $month: '$updatedAt' } } },
                        { $match: { month: previousMonth4 } },
                        { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                    ],
                    "disbursedAmount6": [
                        { $project: { month: { $month: '$updatedAt' } } },
                        { $match: { month: previousMonth5 } },
                        { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                    ]
                }
            }])

            if (disburseAmountData[0].disbursedAmount1[0] != undefined) { disbursedAmountOne = disburseAmountData[0].disbursedAmount1[0].total; } else { disbursedAmountOne = 0; }
                if (disburseAmountData[0].disbursedAmount2[0] != undefined) { disbursedAmountTwo = disburseAmountData[0].disbursedAmount2[0].total; } else { disbursedAmountTwo = 0; }
                if (disburseAmountData[0].disbursedAmount3[0] != undefined) { disbursedAmountThree = disburseAmountData[0].disbursedAmount3[0].total; } else { disbursedAmountThree = 0; }
                if (disburseAmountData[0].disbursedAmount4[0] != undefined) { disbursedAmountFour = disburseAmountData[0].disbursedAmount4[0].total; } else { disbursedAmountFour = 0; }
                if (disburseAmountData[0].disbursedAmount5[0] != undefined) { disbursedAmountFive = disburseAmountData[0].disbursedAmount5[0].total; } else { disbursedAmountFive = 0; }
                if (disburseAmountData[0].disbursedAmount6[0] != undefined) { disbursedAmountSix = disburseAmountData[0].disbursedAmount6[0].total; } else { disbursedAmountSix = 0; }

                var disbursedGraphAmount = [
                    [disbursedAmountOne, currentMonth, currentMonthYear],
                    [disbursedAmountTwo, previousMonth1, previousMonthYear1],
                    [disbursedAmountThree, previousMonth2, previousMonthYear2],
                    [disbursedAmountFour, previousMonth3, previousMonthYear3],
                    [disbursedAmountFive, previousMonth4, previousMonthYear4],
                    [disbursedAmountSix, previousMonth5, previousMonthYear5]
                ]

            // Disbursed Graph Amount To Patient
                var disbursedGraphAmount1 = 0;
                var disbursedGraphAmount2 = 0;
                var disbursedGraphAmount3 = 0;
                var disbursedGraphAmount4 = 0;
                var disbursedGraphAmount5 = 0;
                var disbursedGraphAmount6 = 0;

                var disbursedGraphAmountData = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "disbursedGraphAmount1": [
                            { $project: { Status: 1, month: { $month: '$updatedAt' } }},
                            { $match: 
                                { $and: [{ month: currentMonth }, 
                                    { $or: [{ ApproveOrReject: 'APPROVE' }, { ApproveOrReject: "Approve" },
                                { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" },
                            { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] 
                                    }] } },
                            { $count: "total" }
                        ],
                        "disbursedGraphAmount2": [
                            { $project: { Status: 1, month: { $month: '$updatedAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth1 }, 
                                    { $or: [{ ApproveOrReject: 'APPROVE' }, { ApproveOrReject: "Approve" },
                                { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" },
                            { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] 
                                    }] } },
                            { $count: "total" }
                        ],
                        "disbursedGraphAmount3": [
                            { $project: { Status: 1, month: { $month: '$updatedAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth2 }, 
                                    { $or: [{ ApproveOrReject: 'APPROVE' }, { ApproveOrReject: "Approve" },
                                { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" },
                            { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] 
                                    }] } },
                            { $count: "total" }
                        ],
                        "disbursedGraphAmount4": [
                            { $project: { Status: 1, month: { $month: '$updatedAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth3 }, 
                                    { $or: [{ ApproveOrReject: 'APPROVE' }, { ApproveOrReject: "Approve" },
                                { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" },
                            { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] 
                                    }] } },
                            { $count: "total" }
                        ],
                        "disbursedGraphAmount5": [
                            { $project: { Status: 1, month: { $month: '$updatedAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth4 }, 
                                    { $or: [{ ApproveOrReject: 'APPROVE' }, { ApproveOrReject: "Approve" },
                                { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" },
                            { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] 
                                    }] } },
                            { $count: "total" }
                        ],
                        "disbursedGraphAmount6": [
                            { $project: { Status: 1, month: { $month: '$updatedAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth5 }, 
                                    { $or: [{ ApproveOrReject: 'APPROVE' }, { ApproveOrReject: "Approve" },
                                { ApproveOrReject: "approve" }, { ApproveOrReject: "TRUE" }, { ApproveOrReject: "True" },
                            { ApproveOrReject: "true" }, { ApproveOrReject: "Ok" }] 
                                    }] } },
                            { $count: "total" }
                        ]
                    }
                }])

                if (disbursedGraphAmountData[0].disbursedGraphAmount1[0] != undefined) { disbursedGraphAmount1 = disbursedGraphAmountData[0].disbursedGraphAmount1[0].total; } else { disbursedGraphAmount1 = 0; }
                if (disbursedGraphAmountData[0].disbursedGraphAmount2[0] != undefined) { disbursedGraphAmount2 = disbursedGraphAmountData[0].disbursedGraphAmount2[0].total; } else { disbursedGraphAmount2 = 0; }
                if (disbursedGraphAmountData[0].disbursedGraphAmount3[0] != undefined) { disbursedGraphAmount3 = disbursedGraphAmountData[0].disbursedGraphAmount3[0].total; } else { disbursedGraphAmount3 = 0; }
                if (disbursedGraphAmountData[0].disbursedGraphAmount4[0] != undefined) { disbursedGraphAmount4 = disbursedGraphAmountData[0].disbursedGraphAmount4[0].total; } else { disbursedGraphAmount4 = 0; }
                if (disbursedGraphAmountData[0].disbursedGraphAmount5[0] != undefined) { disbursedGraphAmount5 = disbursedGraphAmountData[0].disbursedGraphAmount5[0].total; } else { disbursedGraphAmount5 = 0; }
                if (disbursedGraphAmountData[0].disbursedGraphAmount6[0] != undefined) { disbursedGraphAmount6 = disbursedGraphAmountData[0].disbursedGraphAmount6[0].total; } else { disbursedGraphAmount6 = 0; }

                var disbursedGraphAmt = [
                    [disbursedGraphAmount1, currentMonth, currentMonthYear],
                    [disbursedGraphAmount2, previousMonth1, previousMonthYear1],
                    [disbursedGraphAmount3, previousMonth2, previousMonthYear2],
                    [disbursedGraphAmount4, previousMonth3, previousMonthYear3],
                    [disbursedGraphAmount5, previousMonth4, previousMonthYear4],
                    [disbursedGraphAmount6, previousMonth5, previousMonthYear5]
                ]

                // Rejected Graph Data
                var rejectedGraphAmount1 = 0;
                var rejectedGraphAmount2 = 0;
                var rejectedGraphAmount3 = 0;
                var rejectedGraphAmount4 = 0;
                var rejectedGraphAmount5 = 0;
                var rejectedGraphAmount6 = 0;

                var rejectedGraphData = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "rejectedGraphAmount1": [
                            { $project: { month: { $month: '$createdAt' } }},
                            { $match: 
                                { $and: [{ month: currentMonth }, 
                                    { $or: [{ ApproveOrReject: 'REJECT' }, { ApproveOrReject: "Reject" },
                                { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" },
                            { ApproveOrReject: "False" },] 
                                    }] } },
                                    { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                            { $count: "total" }
                        ],
                        "rejectedGraphAmount2": [
                            { $project: { month: { $month: '$createdAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth1 }, 
                                    { $or: [{ ApproveOrReject: 'REJECT' }, { ApproveOrReject: "Reject" },
                                { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" },
                            { ApproveOrReject: "False" },] 
                                    }] } },
                                    { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                            { $count: "total" }
                        ],
                        "rejectedGraphAmount3": [
                            { $project: { month: { $month: '$createdAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth2 }, 
                                    { $or: [{ ApproveOrReject: 'REJECT' }, { ApproveOrReject: "Reject" },
                                { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" },
                            { ApproveOrReject: "False" },] 
                                    }] } },
                                    { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                            { $count: "total" }
                        ],
                        "rejectedGraphAmount4": [
                            { $project: { month: { $month: '$createdAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth3 }, 
                                    { $or: [{ ApproveOrReject: 'REJECT' }, { ApproveOrReject: "Reject" },
                                { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" },
                            { ApproveOrReject: "False" },] 
                                    }] } },
                                    { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                            { $count: "total" }
                        ],
                        "rejectedGraphAmount5": [
                            { $project: { month: { $month: '$createdAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth4 }, 
                                    { $or: [{ ApproveOrReject: 'REJECT' }, { ApproveOrReject: "Reject" },
                                { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" },
                            { ApproveOrReject: "False" },] 
                                    }] } },
                                    { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                            { $count: "total" }
                        ],
                        "rejectedGraphAmount6": [
                            { $project: { month: { $month: '$createdAt' } }},
                            { $match: 
                                { $and: [{ month: previousMonth5 }, 
                                    { $or: [{ ApproveOrReject: 'REJECT' }, { ApproveOrReject: "Reject" },
                                { ApproveOrReject: "reject" }, { ApproveOrReject: "FALSE" }, { ApproveOrReject: "false" },
                            { ApproveOrReject: "False" },] 
                                    }] } },
                                    { $group: { _id: "$_v", total: { $sum: "$LoanAmount" } } },
                            { $count: "total" }
                        ]
                    }
                }])

                if (rejectedGraphData[0].rejectedGraphAmount1[0] != undefined) { rejectedGraphAmount1 = rejectedGraphData[0].rejectedGraphAmount1[0].total; } else { rejectedGraphAmount1 = 0; }
                if (rejectedGraphData[0].rejectedGraphAmount2[0] != undefined) { rejectedGraphAmount2 = rejectedGraphData[0].rejectedGraphAmount2[0].total; } else { rejectedGraphAmount2 = 0; }
                if (rejectedGraphData[0].rejectedGraphAmount3[0] != undefined) { rejectedGraphAmount3 = rejectedGraphData[0].rejectedGraphAmount3[0].total; } else { rejectedGraphAmount3 = 0; }
                if (rejectedGraphData[0].rejectedGraphAmount4[0] != undefined) { rejectedGraphAmount4 = rejectedGraphData[0].rejectedGraphAmount4[0].total; } else { rejectedGraphAmount4 = 0; }
                if (rejectedGraphData[0].rejectedGraphAmount5[0] != undefined) { rejectedGraphAmount5 = rejectedGraphData[0].rejectedGraphAmount5[0].total; } else { rejectedGraphAmount5 = 0; }
                if (rejectedGraphData[0].rejectedGraphAmount6[0] != undefined) { rejectedGraphAmount6 = rejectedGraphData[0].rejectedGraphAmount6[0].total; } else { rejectedGraphAmount6 = 0; }

                var rejectedAmountData = [
                    [rejectedGraphAmount1, currentMonth, currentMonthYear],
                    [rejectedGraphAmount2, previousMonth1, previousMonthYear1],
                    [rejectedGraphAmount3, previousMonth2, previousMonthYear2],
                    [rejectedGraphAmount4, previousMonth3, previousMonthYear3],
                    [rejectedGraphAmount5, previousMonth4, previousMonthYear4],
                    [rejectedGraphAmount6, previousMonth5, previousMonthYear5],
                ]

                //InProcessGraphToPatient
                var graphInProgress1 = 0;
                var graphInProgress2 = 0;
                var graphInProgress3 = 0;
                var graphInProgress4 = 0;
                var graphInProgress5 = 0;
                var graphInProgress6 = 0;

                var graphInProgressData = await this.PatientAdminDashboardModel.aggregate([{
                    $facet: {
                        "graphInProgress1": [
                            { $project: { month: { $month: '$updatedAt' } } },
                            { $match: { month: currentMonth } },
                            { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                        ],
                        "graphInProgress2": [
                            { $project: { month: { $month: '$updatedAt' } } },
                            { $match: { month: previousMonth1 } },
                            { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                        ],
                        "graphInProgress3": [
                            { $project: { month: { $month: '$updatedAt' } } },
                            { $match: { month: previousMonth2 } },
                            { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                        ],
                        "graphInProgress4": [
                            { $project: { month: { $month: '$updatedAt' } } },
                            { $match: { month: previousMonth3 } },
                            { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                        ],
                        "graphInProgress5": [
                            { $project: { month: { $month: '$updatedAt' } } },
                            { $match: { month: previousMonth4 } },
                            { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                        ],
                        "graphInProgress6": [
                            { $project: { month: { $month: '$updatedAt' } } },
                            { $match: { month: previousMonth5 } },
                            { $group: { _id: '$_v', total: { $sum: 'LoanAmount' } } }
                        ]
                    }
                }])

                if (graphInProgressData[0].graphInProgress1[0] != undefined) { graphInProgress1 = graphInProgressData[0].graphInProgress1[0].total; } else { graphInProgress1 = 0; }
                if (graphInProgressData[0].graphInProgress2[0] != undefined) { graphInProgress2 = graphInProgressData[0].graphInProgress2[0].total; } else { graphInProgress2 = 0; }
                if (graphInProgressData[0].graphInProgress3[0] != undefined) { graphInProgress3 = graphInProgressData[0].graphInProgress3[0].total; } else { graphInProgress3 = 0; }
                if (graphInProgressData[0].graphInProgress4[0] != undefined) { graphInProgress4 = graphInProgressData[0].graphInProgress4[0].total; } else { graphInProgress4 = 0; }
                if (graphInProgressData[0].graphInProgress5[0] != undefined) { graphInProgress5 = graphInProgressData[0].graphInProgress5[0].total; } else { graphInProgress5 = 0; }
                if (graphInProgressData[0].graphInProgress6[0] != undefined) { graphInProgress6 = graphInProgressData[0].graphInProgress6[0].total; } else { graphInProgress6 = 0; }

                var graphInProgressAmount = [
                    [graphInProgress1, currentMonth, currentMonthYear],
                    [graphInProgress2, previousMonth1, previousMonthYear1],
                    [graphInProgress3, previousMonth2, previousMonthYear2],
                    [graphInProgress4, previousMonth3, previousMonthYear3],
                    [graphInProgress5, previousMonth4, previousMonthYear4],
                    [graphInProgress6, previousMonth5, previousMonthYear5],
                ]


                var patientDataDashboard = {
                    resPatientDashboard: resPatientDashboard,
                    disbursedGraphAmount: disbursedGraphAmount,
                    disbursedGraphAmt: disbursedGraphAmt,
                    rejectedAmountData: rejectedAmountData,
                    graphInProgressAmount:graphInProgressAmount
                }

                return {patientDataDashboard};
                


            } catch(e){
                this.logger.error(e);
                throw e;
            }
        }
}