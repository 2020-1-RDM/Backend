import { Router } from 'express';

import userController from './controller/user/userController';
import areaConhecimentoController from './controller/areas_conhecimento/areasConhecimentoController';
import sessionController from './controller/session/sessionController';
import cadastroMentoriaController from './controller/cadastro_mentoria/cadastroMentoriaController';

import authMiddleware from './middlewares/auth';
import upload from './configs/multer/multer';

const routes = new Router();

routes.get('/ping', (req, res) => res.json({ message: 'pong' }));

/*
   Routes of autoconhecimento
 */
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
routes.post('/users', upload.single('image'), userController.insert);
routes.put(
  '/users',
  upload.single('image'),
  authMiddleware,
  userController.update
);
routes.delete('/users', authMiddleware, userController.delete);

/*
    Routes from sessions
 */
routes.post('/login', upload.single('image'), authMiddleware, sessionController.login);

/*
Routes from mentoria
*/
routes.post('/cadastroMentoria', cadastroMentoriaController.insert);
routes.get('/cadastroMentoria', cadastroMentoriaController.get);

export default routes;
