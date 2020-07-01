import path from 'path';
import hbs from 'nodemailer-express-handlebars';
import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';
// eslint-disable-next-line no-unused-vars
import getFirstDate from '../../helper/firstMetoringHelper';
// eslint-disable-next-line import/named
import { getUserCredentials, importUser } from '../user/userController';
import transporter from '../../configs/email/email';
import getNextDateTime from '../../helper/getNextDateTimeHelper';

const db = admin.firestore();

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

async function getMentoringById(id) {
  const result = (await db.collection('mentoria').doc(id).get()).data();
  return result;
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
          email: res.data().email,
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
          email: res.data().email,
        });
      });
    });

  return results;
}
async function getMentorByCPF(cpf) {
  const userCollection = db.collection('user');
  const results = [];

  await userCollection
    .where('cpf', '==', cpf)
    .get()
    .then((snapshot) => {
      return snapshot.forEach((res) => {
        results.push({
          cpf: res.data().cpf,
          name: res.data().name,
          image: res.data().image,
          email: res.data().email,
        });
      });
    });

  return results[0];
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

      const dates = [];
      // let k = 0;
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

      const date = await getNextDateTime(dates, days, hours);

      await mentoringCollection.add({
        image,
        cpf: cpfSession,
        title,
        description,
        knowledgeArea,
        mentoringOption,
        flagDisable: signalFlag,
        isVisible: true,
        dateTime: date,
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

  async getMentoring(request, response) {
    try {
      const { id } = request.params;
      const apiResult = await db.collection('mentoria').doc(id).get();
      const result = apiResult.data();
      result.id = id;
      const mentorInfo = await getMentorByCPF(result.cpf);
      result.mentorInfos = mentorInfo;
      if (!result) {
        return response
          .status(400)
          .json({ error: 'Não foi encontrado essa mentoria' });
      }

      return response.status(200).json(result);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de busca de mentoria. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async getApproved(request, response) {
    try {
      const mentoringCollection = db.collection('mentoria');

      let i = 0;
      const mentorInfos = await getMentores();
      let userFound = false;

      const results = [];
      await mentoringCollection
        .where('flagDisable', '==', false)
        .where('isVisible', '==', true)
        .where('mentoringApproved', '==', true)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            for (i = 0; i < mentorInfos.length; i += 1) {
              if (mentorInfos[i].cpf === doc.data().cpf) {
                userFound = true;
                break;
              }
            }

            if (!userFound) {
              mentorInfos[i].name = 'Usuário não encontrado';
              mentorInfos[i].image = '';
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
              email: '',
            };
            for (i = 0; i < mentorInfos.length; i += 1) {
              if (mentorInfos[i].cpf === doc.data().cpf) {
                mentorInfo.name = mentorInfos[i].name;
                mentorInfo.image = mentorInfos[i].image;
                mentorInfo.email = mentorInfos[i].email;
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
      return response.status(200).json(results);
    } catch (e) {
      return response.status(500).json({
        error: `Erro durante o processamento de busca de mentorias. Espere um momento e tente novamente! Erro : ${e}`,
      });
    }
  },

  async updateMentoring(request, response) {
    try {
      const allDatas = request.body;
      const { id } = request.params;
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoringById(id);

      if (!mentoring) {
        return response
          .status(404)
          .send({ error: 'A mentoria não foi encontrada' });
      }

      Object.keys(allDatas).forEach((el) => {
        if (allDatas[el] === null || allDatas[el] === undefined)
          delete allDatas[el];
      });

      if (request.file !== undefined) {
        const image = await resizeImage(request.file);
        allDatas.image = image !== allDatas.image ? image : allDatas.image;
      } else if (!allDatas.image) {
        delete allDatas.image;
      }
      if (Array.isArray(allDatas.dayOfWeek)) {
        console.log('here');
        mentoring.dateTime.forEach((element) => {
          for (let i = 0; i < allDatas.dayOfWeek.length; i += 1) {
            if (
              allDatas.dayOfWeek[i] === element.day &&
              allDatas.time[i] === element.times[0].hour
            ) {
              allDatas.dayOfWeek.splice(i, 1);
              allDatas.time.splice(i, 1);
            }
            console.log('\nelement');
            console.log(element.day);
            console.log(element.times[0].hour);
            console.log('\nalldatas');
            console.log(allDatas.dayOfWeek[i]);
            console.log(allDatas.time[i]);
          }
        });
      } else {
        mentoring.dateTime.forEach((element) => {
          if (
            allDatas.dayOfWeek === element.day &&
            allDatas.time === element.times[0].hour
          ) {
            delete allDatas.dayOfWeek;
            delete allDatas.time;
          }
        });
      }

      if (allDatas.dayOfWeek) {
        const { dayOfWeek } = allDatas;
        const { time } = allDatas;

        const dates = [];
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
        allDatas.dateTime = await getNextDateTime(dates, days, hours);
        for (let i = 0; i < mentoring.dateTime.length; i += 1)
          allDatas.dateTime.push(mentoring.dateTime[i]);
        if (allDatas.dayOfWeek) delete allDatas[dayOfWeek];
        if (allDatas.time) delete allDatas[time];
      }
      await mentoringCollection.doc(id).update(allDatas);

      return response.status(200).send({
        success: true,
        msg: 'Mentoria atualizada com sucesso',
        data: allDatas,
      });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar mentoria : ${e}`,
      });
    }
  },

  // eslint-disable-next-line consistent-return
  async mentoringEvaluation(request, response) {
    try {
      const { title, approved, mentorEmail } = request.body;
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

      if (flagDisable) {
        const email = {
          from: process.env.EMAIL_USER,
          to: mentorEmail,
          subject: `Mentoria não Aprovada`,
          text: `Sua mentoria de título "${title}" não foi aprovada.\nEntre em contato com o administrador para mais detalhes.`,
        };

        transporter.sendMail(email, (error) => {
          if (error) {
            res.emailStatus = `erro ao enviar email: ${error}`;
            return response.status(200).send(res);
          }
          res.emailStatus = 'email enviado com sucesso';
          return response.status(200).send(res);
        });
      } else {
        return response.status(200).send(res);
      }
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao atualizar mentoria : ${e}`,
      });
    }
  },

  async deactivateMentoring(request, response) {
    try {
      const { id } = request.params;
      const mentoringCollection = db.collection('mentoria');
      const mentoring = await getMentoringById(id);
      if (!mentoring) {
        return response
          .status(404)
          .send({ error: 'A mentoria não foi encontrada' });
      }

      const flag = {
        flagDisable: true,
      };

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

  async changeVisibility(request, response) {
    try {
      const mentoringCollection = db.collection('mentoria');
      const { id } = request.query;
      const mentoring = (await mentoringCollection.doc(id).get()).data();
      if (!mentoring)
        return response.status(404).json({
          error: `Mentoria não encontrada.`,
        });

      if (Object.prototype.hasOwnProperty.call(mentoring, 'isVisible'))
        mentoring.isVisible = !mentoring.isVisible;
      else mentoring.isVisible = false;

      await mentoringCollection
        .doc(id)
        .update({ isVisible: mentoring.isVisible });
      let finalMessage = 'Mentoria esta invisível';
      if (mentoring.isVisible) finalMessage = 'Mentoria esta visível';
      return response.status(200).send({ success: true, msg: finalMessage });
    } catch (e) {
      return response.status(500).json({
        error: `Erro ao trocar visibilidade de mentoria : ${e}`,
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
