const fetch = require("node-fetch");
const Telegraf = require("telegraf");
const cron = require("node-cron");
cron.schedule("45 22 * * *", () => {
  const bot = new Telegraf("TOKEN_BOT");
  fetch("QUESTIONS_API_LINK")
    .then(res => res.json())
    .then(async questions => {
      fetch("ANSWERS_API_LINK")
        .then(res => res.json())
        .then(async answers => {
          resArr = [];
          for (let i in questions) {
            try {
              resArr.push({
                question: questions[i].question,
                answers: [
                  {
                    answer: answers.filter(ans => ans.id_question === questions[i].id).map(ans => ans.answer),
                    correct: answers.filter(ans => ans.id_question === questions[i].id).map(ans => ans.is_correct),
                  },
                ],
                used: questions[i].used,
              });
              if (resArr[i].used === "0") {
                await bot.telegram.sendQuiz("TG_CHANNEL_NAME", resArr[i].question, resArr[i].answers[0].answer, {
                  correct_option_id: resArr[i].answers[0].correct.findIndex(correct => correct === "true"),
                });
                fetch(`QUESTIONS_API_LINK/${questions[i].id}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    used: "1",
                  }),
                  headers: {
                    "Content-type": "application/json; charset=UTF-8",
                  },
                }).then(response => response.json());
              }
            } catch(e) {
              continue;
            }
          }
        });
    });
  bot.launch();
});
