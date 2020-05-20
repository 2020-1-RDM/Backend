import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';

const db = admin.firestore();

async function getMentoriaById(request, response) {
      const id = request.params.id;
    
      const mentorias = await getMentoriaMentor(request);
      if (!mentorias) {
        return response.status(400).send({ error: 'Mentoria não existe' });
      }
      
      let mentoria = mentorias.filter(m => {
        return m.id === id;
      })[0].data;

      return mentoria;
}

async function getMentoriaMentor(request, response) {
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
        dayOfWeek,
        time,
      } = request.body;

      const image = await resizeImage(request.file);
      const mentoriaCollection = db.collection('mentoria');
      const mentoria = await getMentoriaById(request);

      let update = { }
      update.title = title && title != mentoria.title ? title : mentoria.title;
      update.description = description && description != mentoria.description ? description : mentoria.description;
      update.knowledgeArea = knowledgeArea && knowledgeArea != mentoria.knowledgeArea ? knowledgeArea : mentoria.knowledgeArea;
      update.mentoringOption = mentoringOption && mentoringOption != mentoria.mentoringOption ? mentoringOption : mentoria.mentoringOption;
      update.dateTime = dateTime && dateTime != mentoria.dateTime ? dateTime : mentoria.dateTime;
      update.dayOfWeek = dayOfWeek && dayOfWeek != mentoria.dayOfWeek ? dayOfWeek : mentoria.dayOfWeek;
      update.time = time && time != mentoria.time ? time : mentoria.time;
      update.image = image ? image : mentoria.image;

      await mentoriaCollection.doc(id).update(update);
    
      return response
        .status(200)
        .send({ success: true, msg: 'Mentoria atualizada com sucesso', data: update });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar mentoria : ${e}`,
      });
    }
  },

  async deactivateMentoria(request, response) {
    try {
      const {
        flagDesativado
      } = request.body;

      const id = request.params.id;
      const mentoriaCollection = db.collection('mentoria');
      const mentoria = await getMentoriaById(request);

      let flag = { }
      flag.flagDesativado = flagDesativado ? flagDesativado : mentoria.flagDesativado;
    
      await mentoriaCollection.doc(id).update(flag);
    
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
