import { Router } from 'express';
import userController from './controller/user/userController';
import areaConhecimentoController from './controller/areas_conhecimento/areasConhecimentoController';
import upload from './database/multer';

const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'Hello world' }));

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

routes.get('/users', userController.get);
routes.post('/users', upload.array('image', 1), userController.insert);
routes.put('/users', upload.array('image', 1), userController.update);
routes.delete('/users', userController.delete);

routes.post('/login', userController.login);

export default routes;
