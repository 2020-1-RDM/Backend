import jwt from 'jsonwebtoken';
import admin from '../../configs/database/connection';
import jwtAuth from '../../configs/jwt/auth';

const db = admin.firestore();

module.exports = {
  async login(request, response) {
    try {
      const { email, password } = request.body;

      if (!email || !password) {
        return response
          .status(404)
          .json({ error: 'Não foram enviados os dados.' });
      }
      const userCollection = db.collection('user');
      let result = null;
      await userCollection
        .where('email', '==', email)
        .where('password', '==', password)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            result = res.data();
          });
        });

      if (!result) {
        return response.status(401).json({ error: 'Erro de autenticação!' });
      }

      return response.status(200).json({
        result,
        token: jwt.sign(
          {
            cpf: result.cpf,
            email: result.email,
          },
          jwtAuth.secret,
          {
            expiresIn: jwtAuth.expiresIn,
          }
        ),
      });
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
};
