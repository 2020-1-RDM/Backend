async function getFirstDate(dayOfWeek, currentDate) {
  // const cd = Date.now();

  // const currentDate = new Date(cd);

  const currentDayWeek = currentDate.getDay();
  // console.log(currentDayWeek);

  // let mentoriaFirstDay = currentDayWeek;
  let somaParaPrimeiroDia = 0;

  if (dayOfWeek === 'Segunda') {
    if (currentDayWeek === 1) {
      somaParaPrimeiroDia = 7;
    } else if (currentDayWeek === 2) {
      somaParaPrimeiroDia = 6;
    } else if (currentDayWeek === 3) {
      somaParaPrimeiroDia = 5;
    } else if (currentDayWeek === 4) {
      somaParaPrimeiroDia = 4;
    } else if (currentDayWeek === 5) {
      somaParaPrimeiroDia = 3;
    } else if (currentDayWeek === 6) {
      somaParaPrimeiroDia = 2;
    } else if (currentDayWeek === 0) {
      somaParaPrimeiroDia = 1;
    }
  } else if (dayOfWeek === 'Terça') {
    if (currentDayWeek === 1) {
      somaParaPrimeiroDia = 1;
    } else if (currentDayWeek === 2) {
      somaParaPrimeiroDia = 7;
    } else if (currentDayWeek === 3) {
      somaParaPrimeiroDia = 6;
    } else if (currentDayWeek === 4) {
      somaParaPrimeiroDia = 5;
    } else if (currentDayWeek === 5) {
      somaParaPrimeiroDia = 4;
    } else if (currentDayWeek === 6) {
      somaParaPrimeiroDia = 3;
    } else if (currentDayWeek === 0) {
      somaParaPrimeiroDia = 2;
    }
  } else if (dayOfWeek === 'Quarta') {
    if (currentDayWeek === 1) {
      somaParaPrimeiroDia = 2;
    } else if (currentDayWeek === 2) {
      somaParaPrimeiroDia = 1;
    } else if (currentDayWeek === 3) {
      somaParaPrimeiroDia = 7;
    } else if (currentDayWeek === 4) {
      somaParaPrimeiroDia = 6;
    } else if (currentDayWeek === 5) {
      somaParaPrimeiroDia = 5;
    } else if (currentDayWeek === 6) {
      somaParaPrimeiroDia = 4;
    } else if (currentDayWeek === 0) {
      somaParaPrimeiroDia = 3;
    }
  } else if (dayOfWeek === 'Quinta') {
    if (currentDayWeek === 1) {
      somaParaPrimeiroDia = 3;
    } else if (currentDayWeek === 2) {
      somaParaPrimeiroDia = 2;
    } else if (currentDayWeek === 3) {
      somaParaPrimeiroDia = 1;
    } else if (currentDayWeek === 4) {
      somaParaPrimeiroDia = 7;
    } else if (currentDayWeek === 5) {
      somaParaPrimeiroDia = 6;
    } else if (currentDayWeek === 6) {
      somaParaPrimeiroDia = 5;
    } else if (currentDayWeek === 0) {
      somaParaPrimeiroDia = 4;
    }
  } else if (dayOfWeek === 'Sexta') {
    if (currentDayWeek === 1) {
      somaParaPrimeiroDia = 4;
    } else if (currentDayWeek === 2) {
      somaParaPrimeiroDia = 3;
    } else if (currentDayWeek === 3) {
      somaParaPrimeiroDia = 2;
    } else if (currentDayWeek === 4) {
      somaParaPrimeiroDia = 1;
    } else if (currentDayWeek === 5) {
      somaParaPrimeiroDia = 7;
    } else if (currentDayWeek === 6) {
      somaParaPrimeiroDia = 6;
    } else if (currentDayWeek === 0) {
      somaParaPrimeiroDia = 5;
    }
  } else if (dayOfWeek === 'Sábado') {
    if (currentDayWeek === 1) {
      somaParaPrimeiroDia = 5;
    } else if (currentDayWeek === 2) {
      somaParaPrimeiroDia = 4;
    } else if (currentDayWeek === 3) {
      somaParaPrimeiroDia = 3;
    } else if (currentDayWeek === 4) {
      somaParaPrimeiroDia = 2;
    } else if (currentDayWeek === 5) {
      somaParaPrimeiroDia = 1;
    } else if (currentDayWeek === 6) {
      somaParaPrimeiroDia = 7;
    } else if (currentDayWeek === 0) {
      somaParaPrimeiroDia = 6;
    }
  }

  return somaParaPrimeiroDia;

  // if (dayOfWeek === 'Segunda') {
  //   if (currentDayWeek === 1) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 7);
  //     aux = 7;
  //   } else if (currentDayWeek === 2) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 6);
  //     aux = 6;
  //   } else if (currentDayWeek === 3) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 5);
  //   } else if (currentDayWeek === 4) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 4);
  //   } else if (currentDayWeek === 5) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 3);
  //   } else if (currentDayWeek === 6) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 2);
  //   } else if (currentDayWeek === 0) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 1);
  //   }
  // } else if (dayOfWeek === 'Terça') {
  //   if (currentDayWeek === 1) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 1);
  //   } else if (currentDayWeek === 2) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 7);
  //   } else if (currentDayWeek === 3) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 6);
  //   } else if (currentDayWeek === 4) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 5);
  //   } else if (currentDayWeek === 5) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 4);
  //   } else if (currentDayWeek === 6) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 3);
  //   } else if (currentDayWeek === 0) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 2);
  //   }
  // } else if (dayOfWeek === 'Quarta') {
  //   if (currentDayWeek === 1) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 2);
  //   } else if (currentDayWeek === 2) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 1);
  //   } else if (currentDayWeek === 3) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 7);
  //   } else if (currentDayWeek === 4) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 6);
  //   } else if (currentDayWeek === 5) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 5);
  //   } else if (currentDayWeek === 6) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 4);
  //   } else if (currentDayWeek === 0) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 3);
  //   }
  // } else if (dayOfWeek === 'Quinta') {
  //   if (currentDayWeek === 1) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 3);
  //   } else if (currentDayWeek === 2) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 2);
  //   } else if (currentDayWeek === 3) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 1);
  //   } else if (currentDayWeek === 4) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 7);
  //   } else if (currentDayWeek === 5) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 6);
  //   } else if (currentDayWeek === 6) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 5);
  //   } else if (currentDayWeek === 0) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 4);
  //   }
  // } else if (dayOfWeek === 'Sexta') {
  //   if (currentDayWeek === 1) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 4);
  //   } else if (currentDayWeek === 2) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 3);
  //   } else if (currentDayWeek === 3) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 2);
  //   } else if (currentDayWeek === 4) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 1);
  //   } else if (currentDayWeek === 5) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 7);
  //   } else if (currentDayWeek === 6) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 6);
  //   } else if (currentDayWeek === 0) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 5);
  //   }
  // } else if (dayOfWeek === 'Sábado') {
  //   if (currentDayWeek === 1) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 5);
  //   } else if (currentDayWeek === 2) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 4);
  //   } else if (currentDayWeek === 3) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 3);
  //   } else if (currentDayWeek === 4) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 2);
  //   } else if (currentDayWeek === 5) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 1);
  //   } else if (currentDayWeek === 6) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 7);
  //   } else if (currentDayWeek === 0) {
  //     mentoriaFirstDay = currentDate.setDate(currentDate.getDate() + 6);
  //   }
  // }

  // return mentoriaFirstDay;
}

export default getFirstDate;
