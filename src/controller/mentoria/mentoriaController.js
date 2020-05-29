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


async function getMentoriaByMentoringId(id) {
  try {
    const mentoringCollection = db.collection('mentoria');
    let results;
    await mentoringCollection
      .where('flagDisable', '==', false)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.id === id) {
            results = doc.data();
          }
        });
      });

    return results;
  } catch (e) {
    return null;
  }
}



module.exports = {
  async insert(request, response) {
    try {
      const {
        title,
        description,
        knowledgeArea,
        mentoringOption,
        dayOfWeek= [],
        time = [],
      } = request.body;

      const signalFlag = false;

      const image = await resizeImage(request.file);

      const cpfSession = request.tokenCpf;

      const mentoringCollection = db.collection('mentoria');

      // controls the number of weeks to be scheduled
      const weeksController = 4;
      let dates = [];
      let k = 0;
      let days = [];
      let hours = [];

      if(!Array.isArray(dayOfWeek)){
        days.push(dayOfWeek);
        hours.push(time);
      }else {
        days = dayOfWeek;
        hours = time;
      }

      for (let i = 0; i < days.length; i += 1) {
        const currentDate = new Date();

        let sumForFirstDay = await getFirstDate(days[i], currentDate);

        for (let j = 0; j < weeksController; j += 1) {
          if (j !== 0) {
            sumForFirstDay = 7;
          }
          currentDate.setDate(currentDate.getDate() + sumForFirstDay);

          const mentoringDay = `${currentDate.getDate(currentDate)}/${
            currentDate.getMonth(currentDate) + 1
          }/${currentDate.getFullYear(currentDate)}`;

          dates[k] = {
            day: days[i],
            dayOfTheMonth: mentoringDay,
            times: [{ hour: hours, flagBusy: false, typeMentoring: null, descProject: null, mentoradoId: null }],
          };
          k++;
        }
      }
      
      await mentoringCollection.add({
        image,
        cpf: cpfSession,
        title,
        description,
        knowledgeArea,
        mentoringOption,
        flagDisable: signalFlag,
        dateTime: dates,
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

  async getAll(request, response) {
    try {
      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection
        .where('flagDisable', '==', false)
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

  async choiceMentoring(request, response) {
    try {
      const { typeMentoring, descProject, date, hour } = request.body;

      let isAvailable = false;
      const mentoradoId = request.tokenCpf;
      const { id } = request.params;
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoriaByMentoringId(id);

      for (let x = 0; x < mentoring.dateTime.length; x += 1) {
        if (
          mentoring.dateTime[x].dayOfTheMonth === date &&
          mentoring.dateTime[x].times[0].hour === hour
        ) {
          if (mentoring.dateTime[x].times[0].flagBusy === false) {
            mentoring.dateTime[x].times[0].typeMentoring = typeMentoring;
            mentoring.dateTime[x].times[0].descProject = descProject;
            mentoring.dateTime[x].times[0].flagBusy = true;
            mentoring.dateTime[x].times[0].mentoradoId = mentoradoId;
            isAvailable = true;
            break;
          }
        }
      }

      await mentoringCollection.doc(id).update(mentoring);

      if (isAvailable) {
        return response.status(200).send({
          success: true,
          msg: 'Inscrição efetuada',
        });
      }
      return response.status(400).send({
        success: false,
        msg: 'Mentoria indisponível',
      });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao realizar inscrição : ${e}`,
      });
    }
  },
};