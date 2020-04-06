import { Router } from 'express';
import userController from './controller/user/userController';

const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'Hello world' }));

routes.get('/users', userController.get);
routes.post('/users', userController.insert);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);

routes.post('/login', userController.login);

export default routes;
