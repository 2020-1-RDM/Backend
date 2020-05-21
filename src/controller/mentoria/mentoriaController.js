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
        // flagDesativado,
        dayOfWeek = [],
        time = [],
      } = request.body;

      const image = await resizeImage(request.file);

      const cpfSession = request.tokenCpf;

      const mentoriaCollection = db.collection('mentoria');

      const dateTimeCollection = db.collection('dateTime');

      /*const cd = Date.now();

      const currentDate = new Date(cd);
      currentDate.setDate(currentDate.getDate() + 20);
      const ano = currentDate.getFullYear(currentDate);
      const mes = currentDate.getMonth(currentDate);
      const dia = currentDate.getDate(currentDate);
      const dataCompleta = dia + '/' + mes + '/' + ano;
      console.log (dataCompleta);
      //console.log(currentDate.getMonth(currentDate));

      const d = new Date(2019, 0, 3);
      d.setDate(d.getDate() + 1);
      console.log(d);
      */
      let timeDate = [{}];
      let dateTimeId;
      // eslint-disable-next-line no-plusplus
      for (let x = 0; x < dayOfWeek.length; x++) {
        const cd = Date.now();
        const currentDate = new Date(cd);
        
        const sumForFirstDay = await getFirstDate(dayOfWeek[x], currentDate);
        
        console.log(sumForFirstDay);
        
        currentDate.setDate(currentDate.getDate() + sumForFirstDay);
        const mentorinDay1 = currentDate.getDate(currentDate) + '/' + currentDate.getMonth(currentDate) + '/' + currentDate.getFullYear(currentDate);
        
        console.log(mentorinDay1);

        currentDate.setDate(currentDate.getDate() + 7);
        const mentorinDay2 = currentDate.getDate(currentDate) + '/' + currentDate.getMonth(currentDate) + '/' + currentDate.getFullYear(currentDate);

        console.log(mentorinDay2);

        currentDate.setDate(currentDate.getDate() + 7);
        const mentorinDay3 = currentDate.getDate(currentDate) + '/' + currentDate.getMonth(currentDate) + '/' + currentDate.getFullYear(currentDate);

        currentDate.setDate(currentDate.getDate() + 7);
        const mentorinDay4 = currentDate.getDate(currentDate) + '/' + currentDate.getMonth(currentDate) + '/' + currentDate.getFullYear(currentDate);


        timeDate = [
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentorinDay1,
            times: [
              {
                hour: time[x],
                flag: false,
              },
            ],
          },
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentorinDay2,
            times: [
              {
                hour: time[x],
                flag: false,
              },
            ],
          },
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentorinDay3,
            times: [
              {
                hour: time[x],
                flag: false,
              },
            ],
          },
          {
            day: dayOfWeek[x],
            dayOfTheMonth: mentorinDay4,
            times: [
              {
                hour: time[x],
                flag: false,
              },
            ],
          },
        ];
        dateTimeId = await (await dateTimeCollection.add({ timeDate })).id;
        console.log(dateTimeId);
      }

      //const dateTimeId = await (await dateTimeCollection.add({ timeDate })).id;

      //console.log(dateTimeId);

      await mentoriaCollection.add({
        image,
        cpf: cpfSession,
        title,
        description,
        knowledgeArea,
        mentoringOption,
        // flagDesativado: false,
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
};

// const timeDate = [
//   {
//     date: '15/05/2020',
//     times: [
//       {
//         time: '11:00',
//         flag: false,
//       },
//       {
//         time: '12:00',
//         flag: false,
//       },
//     ],
//   },
//   {
//     date: '22/05/2020',
//     times: [
//       {
//         time: '11:00',
//         flag: false,
//       },
//       {
//         time: '12:00',
//         flag: false,
//       },
//     ],
//   },
// ];
