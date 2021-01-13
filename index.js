const fetch = require("node-fetch");
const Telegraf = require("telegraf");

const bot = new Telegraf("");
setInterval(async () => {
  fetch("api questions here")
    .then(res => res.json())
    .then(async questions => {
      fetch("api answers here")
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
                await bot.telegram.sendQuiz("@directquiztestchannel", resArr[i].question, resArr[i].answers[0].answer, {
                  correct_option_id: resArr[i].answers[0].correct.findIndex(correct => correct === "true"),
                });
                fetch(`api questions here/${questions[i].id}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    used: "1",
                  }),
                  headers: {
                    "Content-type": "application/json; charset=UTF-8",
                  },
                }).then(response => response.json());
              }
            } catch {
              continue;
            }
          }
        });
    });
}, 60000);

bot.launch();
