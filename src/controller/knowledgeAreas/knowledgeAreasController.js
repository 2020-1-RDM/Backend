import admin from '../../configs/database/connection';

require('dotenv').config();

const db = admin.firestore();

async function getAllMentoring() {
  const mentoriaCollection = db.collection('mentoria');
  const results = [];
  await mentoriaCollection
  .where('mentoringApproved', '==', true)
  .where('flagDisable', '==', false)
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      results.push(doc.data());
    });
  });
  return results;
}

async function filterValidKnowledgeAreas(knowledgAreas) {
  const filteredResult = [];
  const allMentorings = await getAllMentoring();
  for (let i = 0; i < knowledgAreas.length; i += 1) {
    for (let j = 0; j < allMentorings.length; j += 1) {
      if (knowledgAreas[i].name === allMentorings[j].knowledgeArea) {
        filteredResult.push(knowledgAreas[i]);
        break;
      }
    }
  }
  return filteredResult;
}

async function getAll() {
  const knowledgeAreasCollection = db.collection('area_conhecimento');
  const result = [];
  await knowledgeAreasCollection.get().then((snapshot) => {
    return snapshot.forEach((res) => {
      result.push(res.data());
    });
  });
  return result;
}

module.exports = {
  async get(request, response) {
    try {
      const result = await getAll();
      if (!result) {
        return response.status(404).json({ error: 'Não foi encontrado.' });
      }
      return response.status(200).send(result);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async getValid(request, response) {
    try {
      let result = await getAll();
      result = await filterValidKnowledgeAreas(result);
      if (!result) {
        return response.status(404).json({ error: 'Não foi encontrado.' });
      }
      return response.status(200).send(result);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async insert(request, response) {
    try {
      const { name } = request.body;

      const knowledgeAreasCollection = db.collection('area_conhecimento');

      let idArea = null;
      await knowledgeAreasCollection
        .where('name', '==', name)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            idArea = res.data();
          });
        });
      if (idArea) {
        return response
          .status(400)
          .send({ error: 'Área de conhecimento já existe.' });
      }

      await knowledgeAreasCollection.add({
        name,
      });
      return response.status(201).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processo de cadastro de Área de conhecimento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async update(request, response) {
    try {
      // eslint-disable-next-line prefer-const
      let { name, newName } = request.body;

      const knowledgeAreasCollection = db.collection('area_conhecimento');

      let idArea = null;
      await knowledgeAreasCollection
        .where('name', '==', name)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            idArea = res.id;
          });
        });
      if (!idArea) {
        return response
          .status(400)
          .send({ error: 'Área de conhecimento não existe.' });
      }
      name = newName;
      await knowledgeAreasCollection.doc(idArea).set({
        name,
      });
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de atualização da área de conhecimento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async delete(request, response) {
    try {
      const { name } = request.body;

      const knowledgeAreasCollection = db.collection('area_conhecimento');

      let idArea = null;
      await knowledgeAreasCollection
        .where('name', '==', name)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            idArea = res.id;
          });
        });
      if (!idArea) {
        return response.status(400).send({ error: 'Usuário não existe.' });
      }

      await knowledgeAreasCollection.doc(idArea).delete();
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de deleção da área de conhecimento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async integrateUserArea(request, response) {
    try {
      const { name, user } = request.body;
      if (!name || !user) {
        return response
          .status(404)
          .json({ error: 'Não foi encontrado esse usuário' });
      }
      const knowledgeAreasCollection = db.collection('area_conhecimento');
      const userCollection = db.collection('user');
      let resultArea = null;
      let resultUser = null;
      const listAreas = new Set();
      await knowledgeAreasCollection
        .where('name', '==', name)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            resultArea = res.data().name;
          });
        });
      await userCollection
        .where('user', '==', user)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            resultUser = res.id;
            if (res.data().areas) {
              const { areas } = res.data();
              areas.forEach((area) => listAreas.add(area));
            }
          });
        });
      if (!resultArea) {
        return response
          .status(404)
          .json({ error: 'Não foi encontrado essa área de conhecimento' });
      }
      if (!resultUser) {
        return response
          .status(404)
          .json({ error: 'Não foi encontrado esse usuário' });
      }
      listAreas.add(resultArea);
      await userCollection.doc(resultUser).update({
        areas: Array.from(listAreas),
      });
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de integração entre usuário e área de conhecimento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async deintegrateUserArea(request, response) {
    try {
      const { name, user } = request.body;
      if (!name || !user) {
        return response
          .status(404)
          .json({ error: 'Não foi encontrado esse usuário' });
      }
      const userCollection = db.collection('user');
      let resultUser = null;
      let listAreas = [];
      await userCollection
        .where('user', '==', user)
        .get()
        .then((snapshot) => {
          return snapshot.forEach((res) => {
            resultUser = res.id;
            if (res.data().areas) {
              listAreas = res.data().areas;
            }
          });
        });
      if (!resultUser) {
        return response
          .status(404)
          .json({ error: 'Não foi encontrado esse usuário' });
      }
      if (!listAreas) {
        return response.status(404).json({
          error:
            'Não foi encontrado esse as áreas de conhecimento desse usuário',
        });
      }
      if (listAreas.includes(name))
        listAreas = listAreas.filter((value) => {
          return value !== name;
        });
      else {
        return response.status(404).json({
          error: 'Não foi encontrado essa área de conhecimento nesse usuário',
        });
      }
      await userCollection.doc(resultUser).update({
        areas: Array.from(listAreas),
      });
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de separação entre user e área de conhecimento. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
};
