import admin from 'firebase-admin';
import serviceAccount from './dbconfig2.json';

require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

export default admin;
