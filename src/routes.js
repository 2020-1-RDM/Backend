import { Router } from 'express';


const routes = new Router();
const userController = require('./controller/user/userController');


routes.get('/', (req, res) => res.json({ message: 'Hello world' }));

routes.get('/users', userController.get);
routes.post('/users', userController.insert);
routes.put('/users', userController.update);
routes.delete('/users', userController.delete);

routes.post('/login', userController.login);


export default routes;