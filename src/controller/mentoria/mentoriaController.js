import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';

const db = admin.firestore();

async function getMentoriaTeste(request, response) {
  try {
    const mentoriaCollection = db.collection('mentoria');
    const results = [];
    await mentoriaCollection
      .where('cpf', '==', request.tokenCpf)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            data: doc.data()});
        });
      });
    if (!results.length) {
      return null;
    }
    return results;
  } catch (e) {
    return null;
  }
};

module.exports = {
  async insert(request, response) {
    try {
      const {
        title,
        description,
        knowledgeArea,
        mentoringOption,
        dateTime,
        dayOfWeek,
      } = request.body;

      const image = await resizeImage(request.file);

      const cpfSession = request.tokenCpf;

      const mentoriaCollection = db.collection('mentoria');

      await mentoriaCollection.add({
        image,
        cpf: cpfSession,
        title,
        description,
        knowledgeArea,
        mentoringOption,
        dateTime,
        dayOfWeek,
      });

      return response.status(200).send({ success: true });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao inserir mentoria : ${e}`,
      });
    }
  },

  async getMentoriaSession(request, response) {
    try {
      const mentoriaCollection = db.collection('mentoria');
      const results = [];
      await mentoriaCollection
        .where('cpf', '==', request.tokenCpf)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            results.push(doc.data());
          });
        });
      if (!results.length) {
        return response
          .status(400)
          .json({ error: 'Não tem mentorias para serem listados' });
      }
      return response.status(200).json(results);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de busca de mentorias. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async getAll(request, response) {
    try {
      const mentoriaCollection = db.collection('mentoria');
      const results = [];
      await mentoriaCollection.get().then((snapshot) => {
        snapshot.forEach((doc) => {
          results.push(doc.data());
        });
      });
      if (!results.length) {
        return response
          .status(400)
          .json({ error: 'Não tem mentorias para serem listadas' });
      }
      return response.status(200).json(results);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de busca de mentorias. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async updateMentoria(request, response) {
    try {
      const {
        title,
        description,
        knowledgeArea,
        mentoringOption,
        dateTime,
        dayOfWeek,
      } = request.body;
      
      if (request.file){
        const image = await resizeImage(request.file);
      }
      
      const mentoriaCollection = db.collection('mentoria');
    
       const mentoria = await getMentoriaTeste(request);
      if (!mentoria) {
        return response.status(400).send({ error: 'Mentoria não existe' });
      }
      let update = { }
      if (title) {
        update.title = title;
      }
      if (description) {
        update.description = description;
      }
      if (knowledgeArea) {
        update.knowledgeArea = knowledgeArea;
      }
      if (mentoringOption) {
        update.mentoringOption = mentoringOption;
      }
      if (dateTime) {
        update.dateTime = dateTime;
      }
      if (dayOfWeek) {
        update.dayOfWeek = dayOfWeek;
      }
      //ARRUMAR AQUI
      // if (image) {
      //   update.image = image;
      // }
      
      await mentoriaCollection.doc(mentoria[0].id).update({
        title: update.title,
        description: update.description,
        knowledgeArea: update.knowledgeArea, 
        mentoringOption: update.mentoringOption,
        dateTime: update.dateTime, 
        dayOfWeek: update.dayOfWeek,
        //ARRUMAR AQUI
        //image: update.image
      });
    

      return response
        .status(200)
        .send({ success: true, msg: 'Mentoria atualizado com sucesso' });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar mentoria : ${e}`,
      });
    }
  }
};
