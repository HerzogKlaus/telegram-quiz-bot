// const cron = require("node-cron");

const fetch = require("node-fetch");
const Telegraf = require("telegraf");

const bot = new Telegraf("");

// let task = cron.schedule("* * * * *", () => {
fetch("http://directquiz.ru/questions")
  .then((res) => res.json())
  .then((data) => {
    bot.on("message", async (ctx) => {
      for (let i in data) {
        if (data[i].used === "0") {
          await ctx.replyWithQuiz(
            data[i].questionText,
            data[i].answers.split(","),
            {
              correct_option_id: data[i].correct,
              chat_id: "@directquiztestchannel",
            }
          );
        }
        fetch(`http://directquiz.ru/questions/${data[i].id}`, {
          method: "PATCH",
          body: JSON.stringify({
            used: 1,
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
