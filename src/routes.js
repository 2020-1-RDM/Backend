import { Router } from 'express';
import userController from './controller/user/userController';
import sessionController from './controller/session/sessionController';
import authMiddleware from './middlewares/auth';

const routes = new Router();

routes.get('/ping', (req, res) => res.json({ message: 'pong' }));

/*
    Routes of users
 */
routes.get('/users', authMiddleware, userController.get);
routes.post('/users', authMiddleware, userController.insert);
routes.put('/users', authMiddleware, userController.update);
routes.delete('/users', authMiddleware, userController.delete);

/*
    Routes from sessions
 */
routes.post('/login', sessionController.login);

export default routes;
