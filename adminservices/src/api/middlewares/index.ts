import attachCurrentUser from './attachCurrentUser';
import requiredOrg from './checkOrg';
import isAuth from './isAuth';
import requiredRole from './checkRole'

export default {
  attachCurrentUser,
  isAuth,
  requiredOrg,
  requiredRole
};
