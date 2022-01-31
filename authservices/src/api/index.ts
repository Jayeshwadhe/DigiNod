import { Router } from 'express';
import auth from './routes/auth';
import user from './routes/user';
import agendash from './routes/agendash';
import bimaGarage from './routes/bimaGarage';

// guaranteed to get dependencies
export default () => {
	const app = Router();
	auth(app);
	user(app);
	bimaGarage(app)
	agendash(app);

	return app
}