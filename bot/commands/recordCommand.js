const recordService = require("../../app/services/recordService");
const champService = require("../../app/services/championService");
const { getMemberNick } = require("../botUtils");

// 전적 검색 명령어
module.exports = [
  {
    name: "전적",
    run: async (client, msg, args) => {
      const riot_name = getMemberNick(msg, args);
      const guild_id = msg.guild.id;

      await recordService
        .getAllRecord(riot_name, guild_id)
        .then((result) => {
          // msg.channel.send({embeds: [result]});
          msg.reply(result);
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });
    },
  },
  {
    name: "최근전적",
    run: async (client, msg, args) => {
      const riot_name = getMemberNick(msg, args);
      const guild_id = msg.guild.id;

      await recordService
        .getRecentTenGamesByRiotName(riot_name, guild_id)
        .then((result) => {
          msg.reply(result);
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });
    },
  },
  {
    name: "결과",
    run: async (client, msg, args) => {
      const game_id = args[0];
      const guild_id = msg.guild.id;

      await recordService
        .getRecordByGame(game_id, guild_id)
        .then((result) => {
          msg.reply(result);
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });
    },
  },
];
