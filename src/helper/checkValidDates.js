async function checkValidDates(mentorings) {
  const q = new Date();
  const m = q.getMonth() + 1;
  const d = q.getDay();
  const y = q.getFullYear();
  const currentDate = new Date(y, m, d);
  const validMentorings = [];
  mentorings.forEach((mentoring) => {
    const dateTimes = mentoring.dateTime;
    dateTimes.forEach((dateTime) => {
      const datePadronized = dateTime.dayOfTheMonth.replace(/ /g, '');
      const formattedDate = datePadronized.split('/');
      const mentoringDate = new Date(
        formattedDate[2],
        formattedDate[1],
        formattedDate[0]
      );
      if (mentoringDate > currentDate){
        validMentorings.push(dateTime);
      }
      console.log(formattedDate);
      console.log(mentoringDate);
    });
  });
}

export default checkValidDates;
