async function getFirstDate(dayOfWeek, currentDate) {
  const currentDayWeek = currentDate.getDay();

  let sumForFirstDay = 0;

  if (dayOfWeek === 'Segunda') {
    if (currentDayWeek === 1) {
      sumForFirstDay = 7;
    } else if (currentDayWeek === 2) {
      sumForFirstDay = 6;
    } else if (currentDayWeek === 3) {
      sumForFirstDay = 5;
    } else if (currentDayWeek === 4) {
      sumForFirstDay = 4;
    } else if (currentDayWeek === 5) {
      sumForFirstDay = 3;
    } else if (currentDayWeek === 6) {
      sumForFirstDay = 2;
    } else if (currentDayWeek === 0) {
      sumForFirstDay = 1;
    }
  } else if (dayOfWeek === 'Terça') {
    if (currentDayWeek === 1) {
      sumForFirstDay = 1;
    } else if (currentDayWeek === 2) {
      sumForFirstDay = 7;
    } else if (currentDayWeek === 3) {
      sumForFirstDay = 6;
    } else if (currentDayWeek === 4) {
      sumForFirstDay = 5;
    } else if (currentDayWeek === 5) {
      sumForFirstDay = 4;
    } else if (currentDayWeek === 6) {
      sumForFirstDay = 3;
    } else if (currentDayWeek === 0) {
      sumForFirstDay = 2;
    }
  } else if (dayOfWeek === 'Quarta') {
    if (currentDayWeek === 1) {
      sumForFirstDay = 2;
    } else if (currentDayWeek === 2) {
      sumForFirstDay = 1;
    } else if (currentDayWeek === 3) {
      sumForFirstDay = 7;
    } else if (currentDayWeek === 4) {
      sumForFirstDay = 6;
    } else if (currentDayWeek === 5) {
      sumForFirstDay = 5;
    } else if (currentDayWeek === 6) {
      sumForFirstDay = 4;
    } else if (currentDayWeek === 0) {
      sumForFirstDay = 3;
    }
  } else if (dayOfWeek === 'Quinta') {
    if (currentDayWeek === 1) {
      sumForFirstDay = 3;
    } else if (currentDayWeek === 2) {
      sumForFirstDay = 2;
    } else if (currentDayWeek === 3) {
      sumForFirstDay = 1;
    } else if (currentDayWeek === 4) {
      sumForFirstDay = 7;
    } else if (currentDayWeek === 5) {
      sumForFirstDay = 6;
    } else if (currentDayWeek === 6) {
      sumForFirstDay = 5;
    } else if (currentDayWeek === 0) {
      sumForFirstDay = 4;
    }
  } else if (dayOfWeek === 'Sexta') {
    if (currentDayWeek === 1) {
      sumForFirstDay = 4;
    } else if (currentDayWeek === 2) {
      sumForFirstDay = 3;
    } else if (currentDayWeek === 3) {
      sumForFirstDay = 2;
    } else if (currentDayWeek === 4) {
      sumForFirstDay = 1;
    } else if (currentDayWeek === 5) {
      sumForFirstDay = 7;
    } else if (currentDayWeek === 6) {
      sumForFirstDay = 6;
    } else if (currentDayWeek === 0) {
      sumForFirstDay = 5;
    }
  } else if (dayOfWeek === 'Sábado') {
    if (currentDayWeek === 1) {
      sumForFirstDay = 5;
    } else if (currentDayWeek === 2) {
      sumForFirstDay = 4;
    } else if (currentDayWeek === 3) {
      sumForFirstDay = 3;
    } else if (currentDayWeek === 4) {
      sumForFirstDay = 2;
    } else if (currentDayWeek === 5) {
      sumForFirstDay = 1;
    } else if (currentDayWeek === 6) {
      sumForFirstDay = 7;
    } else if (currentDayWeek === 0) {
      sumForFirstDay = 6;
    }
  }

  return sumForFirstDay;
}

export default getFirstDate;
