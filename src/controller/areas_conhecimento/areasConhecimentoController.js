import admin from '../../database/connection';

require('dotenv').config();

const db = admin.firestore();

module.exports = {
  async get(request, response) {
    try {
      const areasCollection = db.collection('area_conhecimento');
      const result = [];
      await areasCollection.get().then((snapshot) => {
        return snapshot.forEach((res) => {
          result.push(res.data());
        });
      });
      if (!result) {
        return response.status(404).json({ error: 'Não foi encontrado.' });
      }
      return response.status(200).send(result);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
  async insert(request, response) {
    try {
      const { name } = request.body;

      const areaCollection = db.collection('area_conhecimento');

      let idArea = null;
      await areaCollection
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

      await areaCollection.add({
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

      const areaCollection = db.collection('area_conhecimento');

      let idArea = null;
      await areaCollection
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
      await areaCollection.doc(idArea).set({
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

      const areaCollection = db.collection('area_conhecimento');

      let idArea = null;
      await areaCollection
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

      await areaCollection.doc(idArea).delete();
      return response.status(200).send();
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
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
      const areasCollection = db.collection('area_conhecimento');
      const userCollection = db.collection('user');
      let resultArea = null;
      let resultUser = null;
      const listAreas = new Set();
      await areasCollection
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
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
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
      console.log(listAreas);
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
        error: `Erro durante o processamento do login. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },
};
