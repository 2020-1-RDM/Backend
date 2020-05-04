import bcrypt from 'bcrypt';
import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';

const db = admin.firestore();

const userType = {
  MENTHOR: 1,
  MENTEE: 2,
  BOTH: 3,
};

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

async function getUser(email) {
  const userCollection = db.collection('user');
  let user = null;
  await userCollection
    .where('email', '==', email)
    .get()
    .then((snapshot) => {
      return snapshot.forEach((res) => {
        user = {
          id: res.id,
          data: res.data(),
        };
      });
    });
  if (!user) {
    return null;
  }
  return user;
}

// Auxiliary create functions

// Inserting new menthor
async function newMenthor(request, response) {
  try {
    const { cpf, email, password, name, linkedin, phone, areas } = request.body;

    const image = await resizeImage(request.file);

    const passwordHash = await bcrypt.hash(password, 8);

    const userCollection = db.collection('user');

    const user = await getUser(email);
    if (user) {
      // User already exists

      // Checks type of user to update it or not
      if (
        user.data.userType === userType.MENTHOR ||
        user.data.userType === userType.BOTH
      ) {
        return response.status(400).send({ error: 'Usuário já existe.' });
      }

      const newData = {
        linkedin,
        areas,
        userId: user.id,
        userCollection,
      };

      // User exists but it's type is different
      return addMenthorData(newData, response);
    }

    verifyArea(areas);

    const currentUserType = userType.MENTHOR;

    await userCollection.add({
      password: passwordHash,
      name,
      cpf,
      phone,
      linkedin,
      email,
      image,
      areas,
      userType: currentUserType,
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
    const { linkedin, areas, userId, userCollection } = newData;

    await verifyArea(areas);

    if (linkedin) {
      await userCollection.doc(userId).update({ linkedin });
    }
    if (areas) {
      await userCollection.doc(userId).update({ areas });
    }

    const currentUserType = userType.BOTH;
    await userCollection.doc(userId).update({ userType: currentUserType });

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

    const passwordHash = await bcrypt.hash(password, 8);

    const userCollection = db.collection('user');

    const user = await getUser(email);

    if (user) {
      // User already exists

      if (
        user.data.userType === userType.MENTEE ||
        user.data.userType === userType.BOTH
      ) {
        return response.status(400).send({ error: 'Usuário já existe.' });
      }

      const newData = {
        birthDate,
        registration,
        userId: user.id,
        userCollection,
      };

      // User exists but it's type is different
      return addMenteeData(newData, response);
    }

    const currentUserType = userType.MENTEE;

    await userCollection.add({
      name,
      birthDate,
      cpf,
      phone,
      registration,
      email,
      password: passwordHash,
      image,
      userType: currentUserType,
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
    const { birthDate, registration, userId, userCollection } = newData;

    if (birthDate) {
      await userCollection.doc(userId).update({ birthDate });
    }
    if (registration) {
      await userCollection.doc(userId).update({ registration });
    }

    const currentUserType = userType.BOTH;
    await userCollection.doc(userId).update({ userType: currentUserType });

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
      const user = await getUser(request.sessionEmail);
      if (!user) {
        return response.status(400).json({ error: 'Nenhum usuário' });
      }
      delete user.data.password;
      return response.status(200).json(user.data);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de busca de usuários. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async insert(request, response) {
    try {
      const flag = parseInt(request.body.flag);

      if (flag === userType.MENTHOR) {
        await newMenthor(request, response);
      } else if (flag === userType.MENTEE) {
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
        flag,
        email,
        password,
        name,
        linkedin,
        phone,
        areas,
      } = request.body;

      const image = await resizeImage(request.file);

      const userCollection = db.collection('user');

      const passwordHash = await bcrypt.hash(password, 8);

      const user = await getUser(email);
      const resultArea = [];
      if (!user) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await verifyArea(areas);

      await userCollection.doc(user.id).update({
        password: passwordHash,
        name,
        cpf,
        phone,
        linkedin,
        email,
        userType: flag,
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
        email,
        registration,
        password,
      } = request.body;

      const image = await resizeImage(request.file);

      const userCollection = db.collection('user');

      const user = await getUser(email);
      if (!user) {
        return response.status(400).send({ error: 'Usuário não existe' });
      }

      if (name) {
        await userCollection.doc(user.id).update({ name });
      }
      if (birthDate) {
        await userCollection.doc(user.id).update({ birthDate });
      }
      if (cpf) {
        await userCollection.doc(user.id).update({ cpf });
      }
      if (phone) {
        await userCollection.doc(user.id).update({ phone });
      }
      if (registration) {
        await userCollection.doc(user.id).update({ registration });
      }
      if (password) {
        const passwordHash = await bcrypt.hash(password, 8);
        await userCollection.doc(user.id).update({ password: passwordHash });
      }
      if (image) {
        await userCollection.doc(user.id).update({ image });
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
      const user = await getUser(email);
      if (!user) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await userCollection.doc(user.id).delete();
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
