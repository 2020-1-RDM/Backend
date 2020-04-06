import admin from 'firebase-admin';
import serviceAccount from './dbconfig.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rede-de-mentores-rdm.firebaseio.com',
});

export default admin;
