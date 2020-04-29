import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import admin from '../../configs/database/connection';

const db = admin.firestore();

// Verifications and settings

async function getUserType(email) {
  const userCollection = db.collection('user');
  let currentUserType = null;
  await userCollection
    .where('email', '==', email)
    .get()
    .then((snapshot) => {
      return snapshot.forEach((res) => {
        currentUserType = res.data().userType;
      });
    });
  if (!currentUserType) {
    return null;
  }
  return currentUserType;
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

async function verifyArea(listAreas) {
  const areasCollection = db.collection('area_conhecimento');
  const resultArea = [];

  await areasCollection.get().then((snapshot) => {
    return snapshot.forEach((res) => {
      resultArea.push(res.data());
    });
  });

  for (let i = 0; i < listAreas.length; i += 1) {
    if (!resultArea.includes(listAreas[i]))
      areasCollection.add({ name: listAreas[i] });
  }
}

// Getters

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

// Auxiliary create functions

// Inserting new menthor
async function newMenthor(request, response) {
  const userType = 1;

  try {
    const { cpf, email, password, name, linkedin, phone, areas } = request.body;

    const image = await resizeImage(request.file);

    const userCollection = db.collection('user');

    const dbVerification = await getUsuario(email);
    if (dbVerification) {
      // User already exists
      const currentUserType = await getUserType(email);

      // Checks type of user to update it or not
      if (currentUserType == userType || currentUserType == '3') {
        return response.status(400).send({ error: 'Usuário já existe.' });
      }

      const newData = {
        linkedin,
        areas,
        dbVerification,
        userCollection,
      };

      // User exists but it's type is different
      return addMenthorData(newData, response);
    }

    verifyArea(areas);

    await userCollection.add({
      password,
      name,
      cpf,
      phone,
      linkedin,
      email,
      image,
      areas,
      userType,
    });

    return response.status(200).send({ success: true });
  } catch (e) {
    return response.status(500).json({
      error: `Erro ao inserir usuário : ${e}`,
    });
  }
}

// Adds menthor data to an existing user of type mentee
async function addMenthorData(newData, response) {
  try {
    const { linkedin, areas, dbVerification, userCollection } = newData;

    await verifyArea(areas);

    if (linkedin) {
      await userCollection.doc(dbVerification).update({ linkedin });
    }
    if (areas) {
      await userCollection.doc(dbVerification).update({ areas });
    }

    const userType = 3;
    await userCollection.doc(dbVerification).update({ userType });

    return response
      .status(200)
      .send({ success: true, msg: 'Usuário atualizado com sucesso' });
  } catch (e) {
    return response.status.status(500).json({
      error: `Erro ao atualizar usuário : ${e}`,
    });
  }
}

// Inserting new Mentee
async function newtMentee(request, response) {
  const userType = 2;

  try {
    const {
      name,
      birthDate,
      cpf,
      phone,
      registration,
      email,
      password,
    } = request.body;

    const image = await resizeImage(request.file);

    const userCollection = db.collection('user');

    const dbVerification = await getUsuario(email);

    if (dbVerification) {
      // User already exists
      const currentUserType = await getUserType(email);

      if (currentUserType == userType || currentUserType == '3') {
        return response.status(400).send({ error: 'Usuário já existe.' });
      }

      const newData = {
        birthDate,
        registration,
        dbVerification,
        userCollection,
      };

      // User exists but it's type is different
      return addMenteeData(newData, response);
    }

    // User does not exist
    await userCollection.add({
      name,
      birthDate,
      cpf,
      phone,
      registration,
      email,
      password,
      image,
      userType,
    });

    return response.status(200).send({ success: true });
  } catch (e) {
    return response.status(500).json({
      error: `Erro ao inserir usuário : ${e}`,
    });
  }
}

// Adds mentee data to an existing user of type menthor
async function addMenteeData(newData, response) {
  try {
    const { 
      birthDate, 
      registration, 
      dbVerification, 
      userCollection 
    } = newData;

    if (birthDate) {
      await userCollection.doc(dbVerification).update({ birthDate });
    }
    if (registration) {
      await userCollection.doc(dbVerification).update({ registration });
    }

    const userType = 3;
    await userCollection.doc(dbVerification).update({ userType });

    return response
      .status(200)
      .send({ success: true, msg: 'Usuário atualizado com sucesso' });
  } catch (e) {
    return response.status.status(500).json({
      error: `Erro ao atualizar usuário : ${e}`,
    });
  }
}

// Exported functions
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
        error: `Erro durante o processamento de busca de usuários. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async insert(request, response) {
    try {
      const flag = request.body.flag;

      if (flag == '1') {
        await newMenthor(request, response);
      } else if (flag == '2') {
        await newtMentee(request, response);
      } else {
        return response.status(400).send({
          message: 'Flag precisa ser passada',
        });
      }
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

      const dbVerification = await getUsuario(email);
      const resultArea = [];
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      verifyArea(areas);

      await userCollection.doc(dbVerification).update({
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

      return response
        .status(200)
        .send({ success: true, msg: 'Usuário atualizado com sucesso' });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar usuário : ${e}`,
      });
    }
  },

  async updateMentee(request, response) {
    try {
      const {
        name,
        birthDate,
        cpf,
        phone,
        registration,
        email,
        password,
      } = request.body;

      const image = await resizeImage(request.file);

      const userCollection = db.collection('user');

      const dbVerification = await getUsuario(email);
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe' });
      }

      if (name) {
        await userCollection.doc(dbVerification).update({ name });
      }
      if (birthDate) {
        await userCollection.doc(dbVerification).update({ birthDate });
      }
      if (cpf) {
        await userCollection.doc(dbVerification).update({ cpf });
      }
      if (phone) {
        await userCollection.doc(dbVerification).update({ phone });
      }
      if (registration) {
        await userCollection.doc(dbVerification).update({ registration });
      }
      if (password) {
        await userCollection.doc(dbVerification).update({ password });
      }
      if (image) {
        await userCollection.doc(dbVerification).update({ image });
      }

      return response
        .status(200)
        .send({ success: true, msg: 'Usuário atualizado com sucesso' });
    } catch (e) {
      return response.status.status(500).json({
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
