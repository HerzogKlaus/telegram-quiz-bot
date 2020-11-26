// const cron = require("node-cron");

const fetch = require("node-fetch");
const Telegraf = require("telegraf");

const bot = new Telegraf("");

// let task = cron.schedule("* * * * *", () => {
fetch("http://localhost:1234/questions")
  .then((res) => res.json())
  .then((data) => {
    bot.on("message", async (ctx) => {
      for (let i in data) {
        if (!data[i].usage) {
          await ctx.replyWithQuiz(
            data[i].questionText,
            [
              data[i].answers[0],
              data[i].answers[1],
              data[i].answers[2],
              data[i].answers[3],
            ],
            { correct_option_id: data[i].correct }
          );
        }
        fetch(`http://localhost:1234/questions/${data[i].id}`, {
          method: "PATCH",
          body: JSON.stringify({
            usage: true,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }).then((response) => response.json());
      }
      bot.stop();
    });
  });

bot.launch();
// });

// task.start();
