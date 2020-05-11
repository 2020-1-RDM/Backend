import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';

const db = admin.firestore();

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
       console.log(request.body);
    
       const mentoria = await getMentoriaSession(request);

      if (!mentoria) {
        return response.status(400).send({ error: 'Mentoria não existe' });
      }

      if (title) {
        await mentoriaCollection.doc(mentoria.id).update({ title });
      }
      if (description) {
        await mentoriaCollection.doc(mentoria.id).update({ description });
      }
      if (knowledgeArea) {
        await mentoriaCollection.doc(mentoria.id).update({ knowledgeArea });
      }
      if (mentoringOption) {
        await mentoriaCollection.doc(mentoria.id).update({ mentoringOption });
      }
      if (dateTime) {
        await mentoriaCollection.doc(mentoria.id).update({ dateTime });
      }
      if (dayOfWeek) {
        await mentoriaCollection.doc(mentoria.id).update({ dayOfWeek });
      }
      if (image) {
        await mentoriaCollection.doc(mentoria.id).update({ image });
      }

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
