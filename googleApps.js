// @ts-nocheck
function migrateQuestions() {
  const spreadsheetId = "1R0G0qc8Dyobec9ETBV1WuP_Od9ymzUokI33v2BHcTpU";
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("Quizes");

  // Функция для сборки всех значений в столбце

  const getValuesFromColumn = (sheet, column, startRow, numColums) => {
    startRow = startRow || 1;
    numColums = numColums || 1;
    let lastRow = sheet.getLastRow();
    return sheet.getRange(startRow, column, lastRow - startRow + 1, numColums).getValues();
  };

  // Функция для сборки значений стилей шрифтов в столбце ответов для выделения правильного

  const getFontWeightsFromColumn = (sheet, column, startRow, numColums) => {
    startRow = startRow || 1;
    numColums = numColums || 1;
    let lastRow = sheet.getLastRow();
    return sheet.getRange(startRow, column, lastRow - startRow + 1, numColums).getFontWeights();
  };

  // Получения списка первых, вторых и третьих ответов + форматирование

  let arrQuestionsValues = getValuesFromColumn(sheet, 1, 2, 1).map(question => question.toString());

  let arrAnswersValuesOne = getValuesFromColumn(sheet, 2, 2, 1).map(answer => answer.toString());

  let arrAnswersValuesTwo = getValuesFromColumn(sheet, 3, 2, 1).map(answer => answer.toString());

  let arrAnswersValuesThree = getValuesFromColumn(sheet, 4, 2, 1).map(answer => answer.toString());

  // Получения списка стилей шрифтов первых, вторых и третьих ответов + форматирование

  let arrAnswersFontWeightsOne = getFontWeightsFromColumn(sheet, 2, 2, 1).map(answer => answer.toString());

  let arrAnswersFontWeightsTwo = getFontWeightsFromColumn(sheet, 3, 2, 1).map(answer => answer.toString());

  let arrAnswersFontWeightsThree = getFontWeightsFromColumn(sheet, 4, 2, 1).map(answer => answer.toString());

  // Результирующий массив с объектами {вопрос: текст, ответы: [{ответ: текст, правильный: true/false}]}

  let arrResult = [];

  for (let i in arrQuestionsValues) {
    if (arrAnswersFontWeightsOne[i] === "bold") {
      arrResult.push({
        id: i + 1,
        question: arrQuestionsValues[i],
        answers: [
          { answer: arrAnswersValuesOne[i], isCorrect: true },
          { answer: arrAnswersValuesTwo[i], isCorrect: false },
          { answer: arrAnswersValuesThree[i], isCorrect: false },
        ],
      });
    } else if (arrAnswersFontWeightsTwo[i] === "bold") {
      arrResult.push({
        id: i + 1,
        question: arrQuestionsValues[i],
        answers: [
          { answer: arrAnswersValuesOne[i], isCorrect: false },
          { answer: arrAnswersValuesTwo[i], isCorrect: true },
          { answer: arrAnswersValuesThree[i], isCorrect: false },
        ],
      });
    } else if (arrAnswersFontWeightsThree[i] === "bold") {
      arrResult.push({
        id: i + 1,
        question: arrQuestionsValues[i],
        answers: [
          { answer: arrAnswersValuesOne[i], isCorrect: false },
          { answer: arrAnswersValuesTwo[i], isCorrect: false },
          { answer: arrAnswersValuesThree[i], isCorrect: true },
        ],
      });
    }
  }

  // POST вопросов в API + сравнение с существующими вопросами во избежание повторного поста

  let questions = JSON.parse(UrlFetchApp.fetch("https://dev.vasnaidut.ru/html/directquiz/questions/questions"));

  Utilities.sleep(5 * 1000);

  for (let i in arrResult) {
    if (!questions[i]) {
      let formData = {
        question: arrResult[i].question,
      };

      UrlFetchApp.fetch("https://dev.vasnaidut.ru/html/directquiz/questions/questions", {
        method: "post",
        payload: formData,
      });
    }
  }

  // POST ответов в API + сравнение с существующими вопросами во избежание повторного поста

  for (let i in arrResult) {
    if (!questions[i]) {
      for (let j in arrResult[i].answers) {
        let formData = {
          id_question: Number(i) + 1,
          answer: arrResult[i].answers[j].answer,
          is_correct: arrResult[i].answers[j].isCorrect,
        };

        UrlFetchApp.fetch("https://dev.vasnaidut.ru/html/directquiz/answers/answers", {
          method: "post",
          payload: formData,
        });
      }
    }
  }
}
