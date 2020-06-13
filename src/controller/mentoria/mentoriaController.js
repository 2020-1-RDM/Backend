import path from 'path';
import hbs from 'nodemailer-express-handlebars';
import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';
import getFirstDate from '../../helper/firstMetoringHelper';
import { getUserCredentials } from '../user/userController';
import transporter from '../../configs/email/email';
import { importUser } from '../user/userController';

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

function checkSameHour(days, hours) {
  let check = false;
  days.forEach((element, index) =>
    days.forEach((search, indexSearch) => {
      if (index !== indexSearch) {
        if (element === search) {
          if (hours[index] === hours[indexSearch]) {
            check = true;
          }
        }
      }
    })
  );
  return check;
}

async function getMentoringById(id, menthorID) {
  const mentorings = await getMentoringByMenthor(menthorID);
  if (!mentorings) {
    return null;
  }
  return mentorings.filter((m) => {
    return m.id === id;
  })[0].data;
}

async function getMentoriaByMentoringId(id) {
  try {
    const mentoringCollection = db.collection('mentoria');
    let results = [];
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

async function getMentores() {
  const userCollection = db.collection('user');

  const results = [];
  await userCollection
    .where('userType', '<', 2)
    .get()
    .then((snapshot) => {
      return snapshot.forEach((res) => {
        results.push({
          cpf: res.data().cpf,
          name: res.data().name,
          image: res.data().image,
        });
      });
    });

  await userCollection
    .where('userType', '>', 2)
    .get()
    .then((snapshot) => {
      return snapshot.forEach((res) => {
        results.push({
          cpf: res.data().cpf,
          name: res.data().name,
          image: res.data().image,
        });
      });
    });

  return results;
}

async function triggerEmail(userEmail, datas) {
  transporter.use(
    'compile',
    hbs({
      viewEngine: {
        partialsDir: './src/configs/email/views/',
        defaultLayout: 'email',
        layoutsDir: './src/configs/email/views/layouts',
        extName: '.handlebars',
      },
      viewPath: path.resolve('./src/configs/email/views/layouts'),
      extName: '.handlebars',
    })
  );
  const emailConfiguration = {
    to: userEmail,
    subject: 'Mentoria agendada.',
    template: 'email',
    attachments: [
      {
        filename: 'logo_cabecalho.png',
        path: path.resolve(__dirname, '../../configs/email/logo_cabecalho.png'),
        cid: 'logo',
      },
    ],
    context: {
      mentor: datas.mentor,
      mentorando: datas.mentorando,
      mentoria: datas.mentoria,
      data: datas.data,
      hora: datas.hora,
      descricao: datas.descMentoria,
      tipoMentoria: datas.tipoMentoria,
    },
  };

  transporter.sendMail(emailConfiguration, (err) => {
    return !err;
  });
}

module.exports = {
  async insert(request, response) {
    try {
      const {
        title,
        description,
        knowledgeArea,
        mentoringOption = [],
        dayOfWeek = [],
        time = [],
      } = request.body;

      const signalFlag = false;

      const image = await resizeImage(request.file);

      const cpfSession = request.tokenCpf;

      const mentoringCollection = db.collection('mentoria');

      // controls the number of weeks to be scheduled
      const weeksController = 4;
      const dates = [];
      let k = 0;
      let days = [];
      let hours = [];

      if (!Array.isArray(dayOfWeek)) {
        days.push(dayOfWeek);
        hours.push(time);
      } else {
        if (checkSameHour(dayOfWeek, time)) {
          return response
            .status(400)
            .json({ error: 'Foram selecionado dias e horários iguais!' });
        }

        days = dayOfWeek;
        hours = time;
      }

      for (let i = 0; i < days.length; i += 1) {
        const currentDate = new Date();

        // eslint-disable-next-line no-await-in-loop
        let sumForFirstDay = await getFirstDate(days[i], currentDate);

        for (let j = 0; j < weeksController; j += 1) {
          if (j !== 0) {
            sumForFirstDay = 7;
          }
          currentDate.setDate(currentDate.getDate() + sumForFirstDay);

          const mentoringDay = `${currentDate.getDate()}/${
            currentDate.getMonth() + 1
          }/${currentDate.getFullYear()}`;

          dates[k] = {
            day: days[i],
            dayOfTheMonth: mentoringDay,
            times: [
              {
                hour: hours[i],
                flagBusy: false,
                typeMentoring: null,
                descProject: null,
                mentoradoId: null,
              },
            ],
          };
          k += 1;
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

      let i = 0;
      const mentorInfos = await getMentores();

      const results = [];
      await mentoringCollection
        .where('flagDisable', '==', false)
        .where('mentoringApproved', '==', true)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            for (i = 0; i < mentorInfos.length; i += 1) {
              if (mentorInfos[i].cpf === doc.data().cpf) {
                break;
              }
            }
            results.push({
              idMentoria: doc.id,
              cpf: doc.data().cpf,
              title: doc.data().title,
              flagDisable: doc.data().flagDisable,
              description: doc.data().description,
              mentoringOption: doc.data().mentoringOption,
              dateTime: doc.data().dateTime,
              knowledgeArea: doc.data().knowledgeArea,
              image: doc.data().image,
              mentorInfos: {
                image: mentorInfos[i].image,
                name: mentorInfos[i].name,
              },
            });
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

  async getPending(request, response) {
    try {
      const userType = await getUserCredentials(request.tokenCpf);
      if (userType !== 0) {
        return response.status(401).send('Unauthorized');
      }

      let i = 0;
      const mentorInfos = await getMentores();

      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection
        .where('flagDisable', '==', false)
        .where('mentoringApproved', '==', false)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const mentorInfo = {
              name: 'Não encontrado',
              image: '',
            };
            for (i = 0; i < mentorInfos.length; i += 1) {
              if (mentorInfos[i].cpf === doc.data().cpf) {
                mentorInfo.name = mentorInfos[i].name;
                mentorInfo.image = mentorInfos[i].image;
                break;
              }
            }
            results.push({
              id: doc.id,
              data: doc.data(),
              mentorInfo,
            });
          });
        });
      if (!results.length) {
        return response.status(400).json({ error: 'Sem mentorias pendentes' });
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

  async mentoringEvaluation(request, response) {
    try {
      const { title, approved } = request.body;
      const { id } = request.params;
      let res = null;

      const flagDisable = !approved;

      const mentoringCollection = db.collection('mentoria');

      await mentoringCollection.doc(id).update({
        title,
        mentoringApproved: approved,
        flagDisable,
      });

      await mentoringCollection
        .doc(id)
        .get()
        .then((doc) => {
          res = doc.data();
        });

      return response.status(200).send(res);
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

      if (isAvailable) {
        await mentoringCollection.doc(id).update(mentoring);
        const mentor = (await importUser(mentoring.cpf)).data;
        const mentorando = (await importUser(mentoradoId)).data;
        const hora = hour.substring(0, 5);
        const datas = {
          mentor: mentor.name,
          mentorando: mentorando.name,
          mentoria: mentoring.title,
          data: date,
          hora,
          descMentoria: descProject,
          tipoMentoria: typeMentoring,
        };
        await triggerEmail(mentor.email, datas);

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
