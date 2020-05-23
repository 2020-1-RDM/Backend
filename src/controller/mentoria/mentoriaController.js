import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';

const db = admin.firestore();

async function getMentoringById(id, menthorID) {
      const mentorings = await getMentoringByMenthor(menthorID);
      if (!mentorings) {
        return null;
      }
      let mentoring = mentorings.filter(m => {
        return m.id === id;
      })[0].data;

      return mentoring;
}

async function getMentoringByMenthor(menthorID) {
  try {
    const mentoringCollection = db.collection('mentoria');
    const results = [];
    await mentoringCollection
      .where('cpf', '==', menthorID)
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

      const mentoringCollection = db.collection('mentoria');

      await mentoringCollection.add({
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

  async getMentoringBySession(request, response) {
    try {
      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection
        .where('cpf', '==', request.tokenCpf)
        .where('flagDisable', '==', 'false')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              data: doc.data()});
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
      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection.get().then((snapshot) => {
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

  async updateMentoring(request, response) {
    try {
      const {
        title,
        description,
        knowledgeArea,
        mentoringOption,
        dayOfWeek,
        time,
      } = request.body;
      const menthorID = request.tokenCpf;
      const id = request.params.id;
      const image = await resizeImage(request.file);
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoringById(id, menthorID);
      if(!mentoring) { return response.status(404).send({ error: 'A mentoria não foi encontrada' }); }


      let update = { }
      update.title = title && title != mentoria.title ? title : mentoria.title;
      update.description = description && description != mentoria.description ? description : mentoria.description;
      update.knowledgeArea = knowledgeArea && knowledgeArea != mentoria.knowledgeArea ? knowledgeArea : mentoria.knowledgeArea;
      update.mentoringOption = mentoringOption && mentoringOption != mentoria.mentoringOption ? mentoringOption : mentoria.mentoringOption;
      update.dateTime = dateTime && dateTime != mentoria.dateTime ? dateTime : mentoria.dateTime;
      update.dayOfWeek = dayOfWeek && dayOfWeek != mentoria.dayOfWeek ? dayOfWeek : mentoria.dayOfWeek;
      update.time = time && time != mentoria.time ? time : mentoria.time;
      update.image = image ? image : mentoria.image;

      await mentoringCollection.doc(id).update(update);
    
      return response
        .status(200)
        .send({ success: true, msg: 'Mentoria atualizada com sucesso', data: update });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar mentoria : ${e}`,
      });
    }
  },

  async deactivateMentoring(request, response) {
    try {
      const menthorID = request.tokenCpf;
      const id = request.params.id;
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoringById(id, menthorID);
      if(!mentoring) { return response.status(404).send({ error: 'A mentoria não foi encontrada' }); }

      let flag = { }
      flag.flagDisable = true;
    
      await mentoringCollection.doc(id).update(flag);
    
      return response
        .status(200)
        .send({ success: true, msg: 'Mentoria desativada'});
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao desativar mentoria : ${e}`,
      });
    }
  }
};
