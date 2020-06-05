import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';
import getFirstDate from '../../helper/firstMetoringHelper';

const db = admin.firestore();

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
            data: doc.data(),
          });
        });
      });
    if (!results.length) {
      return null;
    }
    return results;
  } catch (e) {
    return null;
  }
}

async function getMentoringById(id, menthorID) {
  const mentorings = await getMentoringByMenthor(menthorID);
  if (!mentorings) {
    return null;
  }
  const mentoring = mentorings.filter((m) => {
    return m.id === id;
  })[0].data;
  return mentoring;
}

module.exports = {
  async insert(request, response) {
    try {
      const {
        title,
        description,
        knowledgeArea,
        mentoringOption,
        dayOfWeek = [],
        time = [],
      } = request.body;

      const signalFlag = false;

      const image = await resizeImage(request.file);

      const cpfSession = request.tokenCpf;

      const mentoringCollection = db.collection('mentoria');

      const dateTimeCollection = db.collection('dateTime');

      const timeDate = [{}];
      const dateTimeId = [];

      // controls the number of weeks to be scheduled
      const weeksController = 4;

      for (let i = 0; i < dayOfWeek.length; i += 1) {
        const currentDate = new Date();

        // eslint-disable-next-line no-await-in-loop
        let sumForFirstDay = await getFirstDate(dayOfWeek[i], currentDate);

        for (let j = 0; j < weeksController; j += 1) {
          if (j !== 0) {
            sumForFirstDay = 7;
          }
          currentDate.setDate(currentDate.getDate() + sumForFirstDay);

          const mentoringDay = `${currentDate.getDate(currentDate)}/${
            currentDate.getMonth(currentDate) + 1
          }/${currentDate.getFullYear(currentDate)}`;

          timeDate[j] = {
            day: dayOfWeek[i],
            dayOfTheMonth: mentoringDay,
            times: [{ hour: time[i], flagBusy: false }],
          };
        }
        // eslint-disable-next-line no-await-in-loop
        dateTimeId[i] = (await dateTimeCollection.add({ timeDate })).id;
      }

      await mentoringCollection.add({
        image,
        cpf: cpfSession,
        title,
        description,
        knowledgeArea,
        mentoringOption,
        flagDisable: signalFlag,
        dateTime: dateTimeId,
        mentoringApproved: false,
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
        .where('flagDisable', '==', false)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            results.push({
              id: doc.id,
              data: doc.data(),
            });
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

  async getApproved(request, response) {
    try {
      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection
        .where('flagDisable', '==', false)
        .where('mentoringApproved', '==', true)
        .get()
        .then((snapshot) => {
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

  async getPending(request, response){
    try {
      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection
        .where('flagDisable', '==', false)
        .where('mentoringApproved', '==', false)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            results.push(doc.data());
          });
        });
      if (!results.length) {
        return response
          .status(400)
          .json({ error: 'Sem mentorias pendentes' });
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
      let image;
      if (request.file) {
        image = await resizeImage(request.file);
      }
      const menthorID = request.tokenCpf;
      const { id } = request.params;
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoringById(id, menthorID);
      if (!mentoring) {
        return response
          .status(404)
          .send({ error: 'A mentoria não foi encontrada' });
      }

      const update = {};
      update.title =
        title && title !== mentoring.title ? title : mentoring.title;
      update.description =
        description && description !== mentoring.description
          ? description
          : mentoring.description;
      update.knowledgeArea =
        knowledgeArea && knowledgeArea !== mentoring.knowledgeArea
          ? knowledgeArea
          : mentoring.knowledgeArea;
      update.mentoringOption =
        mentoringOption && mentoringOption !== mentoring.mentoringOption
          ? mentoringOption
          : mentoring.mentoringOption;
      update.dayOfWeek =
        dayOfWeek && dayOfWeek !== mentoring.dayOfWeek
          ? dayOfWeek
          : mentoring.dayOfWeek;
      update.time = time && time !== mentoring.time ? time : mentoring.time;
      update.image =
        image && image !== mentoring.image ? image : mentoring.image;

      await mentoringCollection.doc(id).update(update);

      return response.status(200).send({
        success: true,
        msg: 'Mentoria atualizada com sucesso',
        data: update,
      });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar mentoria : ${e}`,
      });
    }
  },

  async mentoringEvaluation(request, response){
    const {title, approved} = request.body;
    const id = request.params.id;
    let res = null;

    const mentoringCollection = db.collection('mentoria');

    await mentoringCollection.doc(id).update({
      title: title,
      mentoringApproved: approved
    })

    await mentoringCollection.doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document!');
      } else {
        res = doc.data();
      }
    })

    return response.status(200).send(res)

  },

  async deactivateMentoring(request, response) {
    try {
      const menthorID = request.tokenCpf;
      const { id } = request.params;
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoringById(id, menthorID);
      if (!mentoring) {
        return response
          .status(404)
          .send({ error: 'A mentoria não foi encontrada' });
      }

      const flag = {};
      flag.flagDisable = true;

      await mentoringCollection.doc(id).update(flag);

      return response
        .status(200)
        .send({ success: true, msg: 'Mentoria desativada' });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao desativar mentoria : ${e}`,
      });
    }
  },
};
