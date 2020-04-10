import admin from '../../configs/database/connection';

const db = admin.firestore();

async function getUsuario(email) {
  const userCollection = db.collection('user');
  let dbVerification = null;
  await userCollection
    .where('email', '==', email)
    .get()
    .then((snapshot) => {
      return snapshot.forEach((res) => {
        dbVerification = res.id;
      });
    });
  if (!dbVerification) {
    return null;
  }
  return dbVerification;
}

module.exports = {
  async get(request, response) {
    try {
      const userCollection = db.collection('user');
      const results = [];
      await userCollection.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          results.push(doc.data());
        });
      });
      if (!results.length) {
        return response
          .status(400)
          .json({ error: 'Não tem usuários para serem listados' });
      }
      return response.status(200).json(results);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async insert(request, response) {
    try {
      const {
        cpf,
        mentorFlag,
        email,
        password,
        name,
        linkedin,
        phone,
      } = request.body;

      const userCollection = db.collection('user');

      const dbVerification = await getUsuario(email);
      if (dbVerification) {
        return response.status(400).send({ error: 'Usuário já existe.' });
      }

      await userCollection.add({
        password,
        name,
        cpf,
        phone,
        linkedin,
        email,
        mentorFlag,
      });
      return response.status(200).send({ success: true });
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async update(request, response) {
    try {
      const {
        cpf,
        mentorFlag,
        email,
        password,
        name,
        linkedin,
        phone,
      } = request.body;

      const userCollection = db.collection('user');
      const dbVerification = await getUsuario(email);

      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      const teste = await userCollection.doc(dbVerification).set({
        password,
        name,
        cpf,
        phone,
        linkedin,
        email,
        mentorFlag,
      });

      console.log(teste);
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async delete(request, response) {
    try {
      const { email } = request.body;

      if (!email) {
        return response
          .status(400)
          .send({ error: 'Variável email dever ser passada ' });
      }

      const userCollection = db.collection('user');
      const dbVerification = await getUsuario(email);
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await userCollection.doc(dbVerification).delete();
      return response
        .status(200)
        .send({ success: true, msg: `${email} removido com sucesso!` });
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
};
