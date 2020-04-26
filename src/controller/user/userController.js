import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import admin from '../../configs/database/connection';

const db = admin.firestore();

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

async function newMenthor(request, response){
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
    if (dbVerification) {
      return response.status(400).send({ error: 'Usuário já existe.' });
    }

    verifyArea(areas);

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
}

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

    console.log(request.body)

    const image = await resizeImage(request.file);

    const userCollection = db.collection('user');

    const dbVerification = await getUsuario(email);
    if (dbVerification) {
      return response.status(400).send({ error: 'Usuário já existe.' });
    }
    
    await userCollection.add({
      name,
      birthDate,
      cpf,
      phone,
      registration,
      email,
      password,
      image,
    });

    return response.status(200).send({ success: true });
  } catch(e) {
    return response.status(500).json({
      error: `Erro ao inserir usuário : ${e}`,
    });
  }
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
        error: `Erro durante o processamento de busca de usuários. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async insert(request, response) {
    try {

      const flag = request.body.flag

      if (flag == "1"){
        await newMenthor(request,response);

      } else if (flag == "2"){
        await newtMentee(request,response);
      } else {
        return response.status(400).send({
          message: "Flag precisa ser passada"
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
      
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      verifyArea(areas);

      if(password) {await userCollection.doc(dbVerification).update({password});}
      if(name) {await userCollection.doc(dbVerification).update({name});}
      if(cpf) {await userCollection.doc(dbVerification).update({cpf});}
      if(phone) {await userCollection.doc(dbVerification).update({phone});}
      if(linkedin) {await userCollection.doc(dbVerification).update({linkedin});}
      if(email) {await userCollection.doc(dbVerification).update({email});}
      if(mentorFlag) {await userCollection.doc(dbVerification).update({mentorFlag});}
      if(image) {await userCollection.doc(dbVerification).update({image});}
      if(areas.length > 0) {await userCollection.doc(dbVerification).update({areas});}

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
        password,
      } = request.body;
      
      const userCollection = db.collection('user');
      
      const dbVerification = await getUsuario(request.email);
      
      if (!dbVerification) {
        return response.status(400).send({ error: 'Usuário não existe'});
      }
      
      if(name) {await userCollection.doc(dbVerification).update({name});}
      if(birthDate) {await userCollection.doc(dbVerification).update({birthDate});}
      if(cpf) {await userCollection.doc(dbVerification).update({cpf});}
      if(phone) {await userCollection.doc(dbVerification).update({phone});}
      if(registration) {await userCollection.doc(dbVerification).update({registration});}
      if(password) {await userCollection.doc(dbVerification).update({password});}
      
      return response
      .status(200)
      .send({ success: true, msg: 'Usuário atualizado com sucesso' });
    } catch(e) {
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
