async function getFirstDate(dayOfWeek, currentDate) {
  const currentDayWeek = currentDate.getDay();

  let sumForFirstDay = 0;

  const dayName = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sabado',
  ];

  for (let i = 1; i < dayName.length; i += 1) {
    if (dayOfWeek === dayName[i]) {
      for (let j = 0; j < dayName.length; j += 1) {
        if (currentDayWeek === j) {
          if (currentDayWeek < i) {
            sumForFirstDay = i - currentDayWeek;
          } else if (currentDayWeek > i) {
            sumForFirstDay = i - currentDayWeek + 7;
          } else {
            sumForFirstDay = 7;
          }
        }
      }
    }
  }

  return sumForFirstDay;
}

export default getFirstDate;
