/* eslint-disable prettier/prettier */
import mongoose from 'mongoose';

const OverviewAdminDashboard = new mongoose.Schema(
    {
        // dashboard
        resgetOverviewDashboard: Object,
        resgetDashboardForBussinessProductWise: Object,
        resgetDashboardForMonth: Object,
        resgetDashboardForMonthProductWise: Object,
        resgetDashboardForOverviewBussiness: Object,
        resgetDashboardForOverviewMonth: Object,
        resgetDashboardForOverviewHospital: Object,
        resgetDashboardForOverviewAggregator: Object
    }
);

export default mongoose.model<mongoose.Document>('OverviewAdminDashboard', OverviewAdminDashboard);