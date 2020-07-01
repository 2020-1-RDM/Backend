import bcrypt from 'bcrypt';
import * as yup from 'yup';
import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';
import jwtAuth from '../../configs/jwt/auth';
import transporter from '../../configs/email/email';

const db = admin.firestore();

const userType = {
  ADMIN: 0,
  MENTHOR: 1,
  MENTEE: 2,
  BOTH: 3,
};

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

// Adds menthor data to an existing user of type mentee
async function addMenthorData(newData, response) {
  try {
    const { linkedin, areas, userId, userCollection } = newData;

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
    return response.status(500).json({
      error: `Erro ao atualizar usuário : ${e}`,
    });
  }
}

// Inserting new menthor
async function newMenthor(request, response) {
  try {
    const { cpf, email, password, name, linkedin, phone, areas } = request.body;

    const image = await resizeImage(request.file);

    const passwordHash = await bcrypt.hash(password, 8);

    const userCollection = db.collection('user');

    const user = await getUser(email);

    if (!yup.string().email().isValidSync(email)) {
      return response.status(400).send({ error: 'E-mail fora do formanto' });
    }

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
    return response.status(500).json({
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

// Exported functions
module.exports = {
  async get(request, response) {
    try {
      const user = await getUser(request.tokenEmail);
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
  async getAll(request, response) {
    try {
      if (parseInt(request.tokenUserType, 10) === userType.ADMIN) {
        const allUsers = [];
        await db
          .collection('user')
          .get()
          .then((snapshot) => {
            return snapshot.forEach((res) => {
              allUsers.push({
                id: res.id,
                data: res.data(),
              });
            });
          });
        return response.status(200).json(allUsers);
      }
      return response.status(405).json({
        error: `Não é possível realizar essa operação para esse usuário`,
      });
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de busca de usuários. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  // eslint-disable-next-line consistent-return
  async insert(request, response) {
    try {
      const userTypeRequest = parseInt(request.body.userType, 10);

      if (userTypeRequest === userType.MENTHOR) {
        await newMenthor(request, response);
      } else if (userTypeRequest === userType.MENTEE) {
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
      const allDatas = request.body;
      const idToken = request.tokenId;

      Object.keys(allDatas).forEach((el) => {
        if (allDatas[el] === null || allDatas[el] === undefined)
          delete allDatas[el];
      });

      if (allDatas.email) {
        if (!yup.string().email().isValidSync(allDatas.email)) {
          return response
            .status(400)
            .send({ error: 'E-mail fora do formato.' });
        }
      }
      if (request.file !== undefined) {
        const image = await resizeImage(request.file);
        allDatas.image = image !== allDatas.image ? image : allDatas.image;
      }

      if (allDatas.userType)
        allDatas.userType = parseInt(allDatas.userType, 10);

      const userCollection = db.collection('user');
      const user = userCollection.doc(idToken);

      if (!user) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await userCollection.doc(user.id).update(allDatas);

      return response.status(200).json({
        token:
          ({
            cpf: allDatas.cpf,
            email: allDatas.email,
            id: user.id,
            userType: user.userType,
          },
          jwtAuth.secret,
          {
            expiresIn: jwtAuth.expiresIn,
          }),
      });
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

  async importUser(cpf) {
    const userCollection = db.collection('user');
    let user = null;
    await userCollection
      .where('cpf', '==', cpf)
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
  },

  async getUserCredentials(userID) {
    const userCollection = db.collection('user');
    const results = [];
    await userCollection
      .where('cpf', '==', userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          results.push(doc.data().userType);
        });
      });
    return results[0];
  },

  // eslint-disable-next-line consistent-return
  async sendVerificationEmail(request, response) {
    try {
      const { email } = request.body;

      const url = process.env.ROOT_URL || 'localhost:8080';

      const user = await getUser(email);

      if (!user) {
        return response
          .status(404)
          .send(`não foi encontrado um usuário com o email ${email}`);
      }

      const userCollection = db.collection('user');

      const passwordRequirementExpiration = new Date();

      passwordRequirementExpiration.setDate(
        passwordRequirementExpiration.getDate() + 1
      );

      await userCollection.doc(user.id).update({
        passwordRequirementExpiration,
      });

      const emailSettings = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Recuperação de senha`,
        text: `Você solicitou uma nova senha. Clique no link abaixo para defini-la:\nhttp://${url}/nova-senha/${user.id}`,
      };

      transporter.sendMail(emailSettings, (error) => {
        if (error) {
          return response.status(400).send(`erro ao enviar email: ${error}`);
        }
        return response
          .status(200)
          .send(`email enviado com sucesso para ${email}`);
      });
    } catch (e) {
      response.status(500).send(`erro ao processar requisição: ${e}`);
    }
  },

  async updatePassword(request, response) {
    try {
      const { id, newPassword } = request.body;

      const passwordHash = await bcrypt.hash(newPassword, 8);

      const userCollection = db.collection('user');

      const currentDate = new Date();

      const validDate = await userCollection
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.data().passwordRequirementExpiration) {
            const dbDate = doc.data().passwordRequirementExpiration.toDate();
            if (dbDate > currentDate) {
              return true;
            }
          }
          response.status(401).send({
            message: 'Solicitação de troca de senha inválida',
          });
          return false;
        })
        .catch((error) => {
          return response
            .status(404)
            .send({ message: `usuário não encontrado: ${error}` });
        });
      if (!validDate) {
        return response;
      }

      await userCollection.doc(id).update({
        password: passwordHash,
        passwordRequirementExpiration: null,
      });

      return response
        .status(202)
        .send({ success: true, msg: 'Senha atualizada com sucesso' });
    } catch (e) {
      return response
        .status(500)
        .send({ error: `erro ao processar a requisição. ${e}` });
    }
  },
};
