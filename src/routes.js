import { Router } from 'express';

import userController from './controller/user/userController';
import knowledgeAreasController from './controller/knowledgeAreas/knowledgeAreasController';
import sessionController from './controller/session/sessionController';
import mentoriaController from './controller/mentoria/mentoriaController';

import authMiddleware from './middlewares/auth';
import upload from './configs/multer/multer';

const routes = new Router();

routes.get('/ping', (req, res) => res.json({ message: 'pong' }));

/*
   Routes of autoconhecimento
 */
routes.get('/areasDisponiveis', authMiddleware, knowledgeAreasController.get);
routes.get(
  '/areaConhecimento',
  authMiddleware,
  knowledgeAreasController.getValid
);
routes.post(
  '/areaConhecimento',
  authMiddleware,
  knowledgeAreasController.insert
);
routes.put(
  '/areaConhecimento',
  authMiddleware,
  knowledgeAreasController.update
);
routes.delete(
  '/areaConhecimento',
  authMiddleware,
  knowledgeAreasController.delete
);

routes.post(
  '/areaConhecimento/integrate',
  knowledgeAreasController.integrateUserArea
);
routes.post(
  '/areaConhecimento/deintegrate',
  knowledgeAreasController.deintegrateUserArea
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
routes.put('/users/alter', authMiddleware, userController.updateMentee);

/*
    Routes from sessions
 */
routes.post('/login', sessionController.login);

/*
Routes from mentoria
*/
routes.post(
  '/cadastroMentoria',
  upload.single('image'),
  authMiddleware,
  mentoriaController.insert
);
routes.get('/mentoriaAll', authMiddleware, mentoriaController.getApproved);
routes.get(
  '/mentoriaSession',
  authMiddleware,
  mentoriaController.getMentoringBySession
);
routes.get(
  '/pendingMentorings',
  authMiddleware,
  mentoriaController.getPending
);

routes.put(
  '/mentoria/alter/:id',
  upload.single('image'),
  authMiddleware,
  mentoriaController.updateMentoring
);
routes.delete(
  '/mentoria/deactivate/:id',
  authMiddleware,
  mentoriaController.deactivateMentoring
);

export default routes;
