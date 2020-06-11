import getFirstDate from './firstMetoringHelper';

// eslint-disable-next-line consistent-return
async function getNextDateTime(dates, days, hours) {
  const weeksController = 4;
  let k = 0;
  const date = dates;

  for (let i = 0; i < days.length; i += 1) {
    const currentDate = new Date();

    // eslint-disable-next-line no-await-in-loop
    let sumForFirstDay = await getFirstDate(days[i], currentDate);

    for (let j = 0; j < weeksController; j += 1) {
      if (j !== 0) {
        sumForFirstDay = 7;
      }
      currentDate.setDate(currentDate.getDate() + sumForFirstDay);

      const mentoringDay = `${currentDate.getDate()} / ${
        currentDate.getMonth() + 1
      } / ${currentDate.getFullYear()}`;

      date[k] = {
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
  return date;
}

export default getNextDateTime;
