import { Container } from 'typedi';
import { Logger } from 'winston';
import supplierAdminService from '../services/supplierAdmin';
import PatientAdminService from '../services/PatientAdminService';
import MerchantAdminService from '../services/MerchantAdminService';
import OverviewAdminService from '../services/OverviewAdminService';
import claimAdminService from '../services/claimAdmin';
import patientLoanAdminService from '../services/patientLoanAdminService';

export default class dashboardDataJob {
    public async handler(job, done): Promise<void> {
        const Logger: Logger = Container.get('logger');
        try {
            Logger.debug('running updateDashboardData job');
            //supplier
            const supplierAdminServiceInstance = Container.get(supplierAdminService);
            await supplierAdminServiceInstance.supplierDashboardJob(null);
            Logger.debug('supplier dashboard data updated');

            //patient
            const PatientAdminServiceInstance = Container.get(PatientAdminService);
            await PatientAdminServiceInstance.patientDashboardJob(null);
            Logger.debug('patient dashboard data updated');

            //patientLoan
            // const patientLoanAdminServiceInstance = Container.get(patientLoanAdminService);
            // await patientLoanAdminServiceInstance.patientLoanDashJob(null, null);
            // Logger.debug('patientLoan dashboard data updated');

            //merchant
            const MerchantAdminServiceInstance = Container.get(MerchantAdminService);
            await MerchantAdminServiceInstance.merchantDashboardJob(null);
            Logger.debug('merchant dashboard data updated');
            //overview
            const OverviewAdminServiceInstance = Container.get(OverviewAdminService);
            await OverviewAdminServiceInstance.OverviewDashboardJob(null);
            Logger.debug('overview dashboard data updated');

            //claim
            const claimAdminServiceInstance = Container.get(claimAdminService);
            await claimAdminServiceInstance.claimDashboardJob(null);
            Logger.debug('claim dashboard data updated');
            Logger.debug("updateDashboardData job completed")
            done();
        } catch (e) {
            Logger.error('🔥 Error with updateDashboardData Job: %o', e);
            done(e);
        }
    }
}
