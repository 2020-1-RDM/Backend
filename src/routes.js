import { Router } from 'express';
import userController from './controller/user/userController';
import areaConhecimentoController from './controller/areas_conhecimento/areasConhecimentoController';
import authMiddleware from './middlewares/auth';

const routes = new Router();

routes.get('/ping', (req, res) => res.json({ message: 'pong' }));

routes.get('/areaConhecimento', areaConhecimentoController.get);
routes.post('/areaConhecimento', areaConhecimentoController.insert);
routes.put('/areaConhecimento', areaConhecimentoController.update);
routes.delete('/areaConhecimento', areaConhecimentoController.delete);
routes.post(
  '/areaConhecimento/integrate',
  areaConhecimentoController.integrateUserArea
);
routes.post(
  '/areaConhecimento/deintegrate',
  areaConhecimentoController.deintegrateUserArea
);


/*
    Routes of users
 */
routes.get('/users', authMiddleware, userController.get);
routes.post('/users', upload.array('image', 1), authMiddleware, userController.insert);
routes.put('/users', upload.array('image', 1), authMiddleware, userController.update);
routes.delete('/users', authMiddleware, userController.delete);

/*
    Routes from sessions
 */
routes.post('/login', sessionController.login);

export default routes;
