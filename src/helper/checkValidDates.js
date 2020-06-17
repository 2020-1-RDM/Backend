async function checkValidDates(mentorings) {
  const currentDate = new Date();
  const validMentorings = [];
  mentorings.forEach((mentoring) => {
    const dateTimes = mentoring.dateTime;
    const validDates = [];
    dateTimes.forEach((dateTime) => {
      const datePadronized = dateTime.dayOfTheMonth.replace(/ /g, '');
      const formattedDate = datePadronized.split('/');
      const mentoringDate = new Date(
        formattedDate[2],
        formattedDate[1] - 1,
        formattedDate[0]
      );
    //   console.log(
    //     `Data na mentoria: ${dateTime.dayOfTheMonth}\n${mentoringDate} >= ${currentDate}? ${mentoringDate >= currentDate}`
    //   );
      if (mentoringDate >= currentDate) {
        validDates.push(dateTime);
      }
    });
    validMentorings.push({
      idMentoria: mentoring.idMentoria,
      cpf: mentoring.cpf,
      title: mentoring.title,
      flagDisable: mentoring.flagDisable,
      description: mentoring.description,
      mentoringOption: mentoring.mentoringOption,
      dateTime: validDates,
      knowledgeArea: mentoring.knowledgeArea,
      image: mentoring.image,
      mentorInfos: mentoring.mentorInfos,
    });
  });
  return validMentorings;
}

export default checkValidDates;
