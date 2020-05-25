import admin from '../../configs/database/connection';
import resizeImage from '../../helper/resizeImageHelper';
import getFirstDate from '../../helper/firstMetoringHelper';

const db = admin.firestore();

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

      const image = await resizeImage(request.file);

      const cpfSession = request.tokenCpf;

      const mentoringCollection = db.collection('mentoria');

      const dateTimeCollection = db.collection('dateTime');

      let timeDate = [{}];
      const dateTimeId = [];

      for (let x = 0; x < dayOfWeek.length; x += 1) {
        const cd = Date.now();
        const currentDate = new Date(cd);

        const sumForFirstDay = await getFirstDate(dayOfWeek[x], currentDate);

        currentDate.setDate(currentDate.getDate() + sumForFirstDay);
        const mentoringDay1 = `${currentDate.getDate(
          currentDate
        )}/${currentDate.getMonth(currentDate)+1}/${currentDate.getFullYear(
          currentDate
        )}`;

        currentDate.setDate(currentDate.getDate() + 7);
        const mentoringDay2 = `${currentDate.getDate(
          currentDate
        )}/${currentDate.getMonth(currentDate)}/${currentDate.getFullYear(
          currentDate
        )}`;

        currentDate.setDate(currentDate.getDate() + 7);
        const mentoringDay3 = `${currentDate.getDate(
          currentDate
        )}/${currentDate.getMonth(currentDate)}/${currentDate.getFullYear(
          currentDate
        )}`;

        currentDate.setDate(currentDate.getDate() + 7);
        const mentoringDay4 = `${currentDate.getDate(
          currentDate
        )}/${currentDate.getMonth(currentDate)}/${currentDate.getFullYear(
          currentDate
        )}`;

        timeDate = [
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentoringDay1,
            times: [{ hour: time[x], flagOcupado: false }],
          },
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentoringDay2,
            times: [{ hour: time[x], flagOcupado: false }],
          },
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentoringDay3,
            times: [{ hour: time[x], flagOcupado: false }],
          },
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentoringDay4,
            times: [{ hour: time[x], flagOcupado: false }],
          },
        ];
        dateTimeId[x] = await (await dateTimeCollection.add({ timeDate })).id;
      }

      await mentoringCollection.add({
        image,
        cpf: cpfSession,
        title,
        description,
        knowledgeArea,
        mentoringOption,
        flagDisable: false,
        dateTime: dateTimeId,
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
      const mentoringCollection = db.collection('mentoria');
      const results = [];
      await mentoringCollection
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
};
