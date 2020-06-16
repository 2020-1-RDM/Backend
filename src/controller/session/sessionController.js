import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
      let id = null;
      await userCollection
        .where('email', '==', email)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            result = res.data();
            id = res.id;
          });
        });

      if (!result) {
        return response.status(401).json({ error: 'Usuário inválido!' });
      }
      // if (!(await bcrypt.compare(password, result.password))) {
      //   return response.status(401).json({ error: 'Senha incorreta' });
      // }

      return response.status(200).json({
        result,
        token: jwt.sign(
          {
            cpf: result.cpf,
            email: result.email,
            id,
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
