import { Router } from 'express';


const routes = new Router();
const userController = require('./controller/user/userController');


routes.get('/', (req, res) => res.json({ message: 'Hello world' }));

routes.get('/users', userController.get);
routes.post('/users', userController.post);


export default routes;
