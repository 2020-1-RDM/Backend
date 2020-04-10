import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
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

async function resizeImage(imageOptions) {
  const [nameFile] = imageOptions.filename.split('.');
  const fileName = `${nameFile}-resized.jpg`;

  await sharp(imageOptions.path)
    .resize(500)
    .jpeg({ quality: 70 })
    .toFile(path.resolve(imageOptions.destination, fileName));

  fs.unlinkSync(imageOptions.path);

  return fileName;
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
        areas,
      } = request.body;

      const image = await resizeImage(request.file);

      const userCollection = db.collection('user');
      const areasCollection = db.collection('area_conhecimento');

      const resultArea = [];

      await areasCollection.get().then((snapshot) => {
        return snapshot.forEach((res) => {
          resultArea.push(res.data());
        });
      });
      /* resultArea.filter((el) => {
        return areas.includes(el.name);
      }); */

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
        image,
        areas,
      });
      return response.status(200).send({ success: true });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao inserir usuário : ${e}`,
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
        areas,
      } = request.body;

      const image = await resizeImage(request.file);

      const userCollection = db.collection('user');
      const areasCollection = db.collection('area_conhecimento');

      const dbVerification = await getUsuario(email);
      const resultArea = [];
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await areasCollection.get().then((snapshot) => {
        return snapshot.forEach((res) => {
          resultArea.push(res.data());
        });
      });

      resultArea.filter((el) => {
        return areas.includes(el.name);
      });

      await userCollection.doc(dbVerification).set({
        password,
        name,
        cpf,
        phone,
        linkedin,
        email,
        mentorFlag,
        image,
        areas: resultArea,
      });

      return response.status(200).send({success: true, msg: "Usuário atualizado com sucesso"});
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar usuário : ${e}`,
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
        error: `Erro ao deletar usuário: ${e}`,
      });
    }
  },
};
