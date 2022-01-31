import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import agendash from './routes/agendash';
import patient from './routes/practoRoute';
import aggregatorRoutes from './routes/aggregatorRoutes';
import lenderRoutes from './routes/lenderRoutes';
import hospitalRoutes from './routes/hospitalRoutes';

// guaranteed to get dependencies
export default () => {
	const app = Router();
	auth(app);
	user(app);
	agendash(app);
	patient(app);
	aggregatorRoutes(app);
	lenderRoutes(app);
	hospitalRoutes(app)
	return app
}