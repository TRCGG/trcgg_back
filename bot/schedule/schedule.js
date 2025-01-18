const cron = require("node-cron");
const axios = require("axios");
const TRC_CHANNEL_ID = process.env.TRC_CHANNEL_ID;

//스케쥴
const cronSchedule = async (client) => {
  cron.schedule("0 17 * * *", async () => {
    const channel = await client.channels.cache.get(TRC_CHANNEL_ID);
    if (channel) {
      channel.send("```19:30 시작합니다. 시작 5분전에 대기해주세요.```");
    }
  });
};

// 웹훅
const sendWebHookLolChess = async () => {
  const url =
    "https://discord.com/api/webhooks/1315616035222589492/0Hi3t2hmXTPiQdfnaYOg2Ff1uDSDb6zZ3m84QVNdOLg4dCYDgLlyB3806QnId9I7nNxh?thread_id=1234521788432650261";
  const message = {
    content:
      "```출석은 17:00부터 게임은 19:30 시작합니다. 시작 5분전에 대기해주세요.\n롤토체스 진행자는 첫 출석찍은 사람입니다. 막판과 대기자관리 부탁드립니다. ```",
  };

  cron.schedule("59 16 * * *", async () => {
    try {
      await axios.post(url, message);
    } catch (e) {
      console.error("Error sending message:", error);
    }
  });
};

module.exports = {
  cronSchedule,
  sendWebHookLolChess,
};
