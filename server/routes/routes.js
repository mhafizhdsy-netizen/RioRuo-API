
import { Router } from 'express';
import api from './api.js';

const routes = Router();
routes.get('/', (_, res) => res.status(200).json({ 
    status: 'Ok', 
    Creator: 'RioRuo', 
    Message: "Don't spam the request motherfucker!", 
    message: 'Scraper API otakudesu' 
}));
routes.use('/v1', api);
routes.use((req, res) => res.status(404).json({ 
    status: 'Error', 
    message: 'There\'s nothing here ;_;',
    path: req.originalUrl
}));
export default routes;
