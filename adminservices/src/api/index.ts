import { Router } from 'express';
import roleBasedAccess from './routes/roleBasedAccess';
import user from './routes/user';
import agendash from './routes/agendash';
import supplierAdmin from './routes/supplierAdmin';
import MerchantAdmin from './routes/MerchantAdmin';
import PatientAdmin from './routes/PatientAdmin';
import OverviewAdmin from './routes/OverviewAdmin';
import claimAdmin from './routes/claimAdmin';
import adminRoute from './routes/adminRoute';
import organizationRoute from './routes/organizationRoute';
import productRoute from './routes/productRoute';
import productMappingRoute from './routes/productMappingRoute';
import aggrLenAssocRoute from './routes/aggrLenAssocRoute';

import patientLoanAdminRoute from './routes/patientLoanAdminRoute';
import practoRoute from './routes/practoRoute';
import companyContent from './routes/companyContent';
import employeeRoute from './routes/employeeRoute';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  roleBasedAccess(app);
  user(app);
  agendash(app);
  supplierAdmin(app);
  MerchantAdmin(app);
  PatientAdmin(app);
  OverviewAdmin(app);
  claimAdmin(app);
  adminRoute(app);
  organizationRoute(app);
  productRoute(app);
  productMappingRoute(app);
  aggrLenAssocRoute(app);
  practoRoute(app);
  companyContent(app);
  patientLoanAdminRoute(app);
  employeeRoute(app)
  return app;
};
