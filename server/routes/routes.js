import { Router } from 'express';
import api from './api.js';

const routes = Router();

// This should explicitly only handle the root of this router,
// which after Vercel rewrite means /api/
routes.get('/', (_, res) => res.status(200).json({ status: 'Ok', message: 'Otakudesu unofficial API By RioRuo - Root of /api endpoint' }));

routes.use('/v1', api);

// This 404 handler should only catch things that fall through *this* router
// and are not handled by / or /v1
routes.use((req, res) => res.status(404).json({ 
  status: 'Error', 
  message: `There's nothing here for path "${req.originalUrl}". Check /v1 endpoints.`,
  hint: 'This route within the /v1 group was not found.'
}));

export default routes;