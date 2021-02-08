// @ts-nocheck
function migrateQuestions() {
  const sheet = SpreadsheetApp.openById("SPREADSHEET_ID").getSheetByName("SHEET_NAME");

  // Функция для сборки всех значений в столбце

  const getValuesFromColumn = (sheet, column, startRow, numColums) => {
    startRow = startRow || 1;
    numColums = numColums || 1;
    let lastRow = sheet.getLastRow();
    return sheet.getRange(startRow, column, lastRow - startRow + 1, numColums);
  };

  // Получение списка первых, вторых и третьих ответов + форматирование

  let arrQuestionsValues = getValuesFromColumn(sheet, 1, 2, 1).getValues().map(question => question.toString()),
    arrAnswersValuesOne = getValuesFromColumn(sheet, 2, 2, 1).getValues().map(answer => answer.toString()),
    arrAnswersValuesTwo = getValuesFromColumn(sheet, 3, 2, 1).getValues().map(answer => answer.toString()),
    arrAnswersValuesThree = getValuesFromColumn(sheet, 4, 2, 1).getValues().map(answer => answer.toString()),

    // Получение списка стилей шрифтов первых, вторых и третьих ответов + форматирование

    arrAnswersFontWeightsOne = getValuesFromColumn(sheet, 2, 2, 1).getFontWeights().map(answer => answer.toString()),
    arrAnswersFontWeightsTwo = getValuesFromColumn(sheet, 3, 2, 1).getFontWeights().map(answer => answer.toString()),
    arrAnswersFontWeightsThree = getValuesFromColumn(sheet, 4, 2, 1).getFontWeights().map(answer => answer.toString()),
    // Результирующий массив с объектами {вопрос: текст, ответы: [{ответ: текст, правильный: true/false}]}

    arrResult = [];

  for (let i in arrQuestionsValues) {
    arrResult.push({
      id: i + 1,
      question: arrQuestionsValues[i],
      answers: [
        arrAnswersFontWeightsOne[i] === "bold" ? { answer: arrAnswersValuesOne[i], isCorrect: true } : { answer: arrAnswersValuesOne[i], isCorrect: false },
        arrAnswersFontWeightsTwo[i] === "bold" ? { answer: arrAnswersValuesTwo[i], isCorrect: true } : { answer: arrAnswersValuesTwo[i], isCorrect: false },
        arrAnswersFontWeightsThree[i] === "bold" ? { answer: arrAnswersValuesThree[i], isCorrect: true } : { answer: arrAnswersValuesThree[i], isCorrect: false },
      ],
    });
  }

  // POST вопросов и ответов в API + сравнение с существующими вопросами во избежание повторного поста

  let questions = JSON.parse(UrlFetchApp.fetch("QUESTIONS_API_LINK"));

  for (let i in arrResult) {
    if (!questions[i]) {
      UrlFetchApp.fetch("QUESTIONS_API_LINK", {
        method: "post",
        payload: {
          question: arrResult[i].question,
        },
      });

      for (let j in arrResult[i].answers) {
        UrlFetchApp.fetch("ANSWERS_API_LINK", {
          method: "post",
          payload: {
            id_question: Number(i) + 1,
            answer: arrResult[i].answers[j].answer,
            is_correct: arrResult[i].answers[j].isCorrect,
          },
        });
      }
    }
  }
}
