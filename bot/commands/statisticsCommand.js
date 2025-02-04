// const recordHandler = require('../handler/recordHandler');
const botUtils = require("../botUtils");
const championService = require("../../app/services/championService");
const recordService = require("../../app/services/recordService");

// 통계 관련 명령어
module.exports = [
  {
    name: "통계",
    run: async (client, msg, args) => {
      let type=undefined, date = undefined;

      if (args.length === 2) {
        [type, date] = args;
      } else if (args.length === 1) {
        type = args[0];
      } else {
        msg.reply("잘못된 형식");
      }

      const guild_id = msg.guild.id;

      if(type === "게임"){
        await recordService
        .getStatisticOfGame(guild_id, type, date)
        .then((result) => {
          msg.reply(botUtils.createEmbed(result));
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });

      }else if(type ==="챔프"){
        await championService
        .getStatisticOfChampion(guild_id, type, date)
        .then((result) => {
          msg.reply(botUtils.createEmbed(result));
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });

      }else {
        msg.reply("명령어 통계 게임/챔프");
      }
    },
  },
  {
    name: "라인",
    run: async (client, msg, args) => {
      const position = args.join(" ").replace(/\s/g, "").trim();
      const guild_id = msg.guild.id;

      await recordService
        .getWinRateByPosition(position, guild_id)
        .then((result) => {
          msg.reply(botUtils.createEmbed(result));
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });
    },
  },
  {
    name: "클랜통계",
    run: async (client, msg, args) => {
        const date = args.join(" ");
        const guild_id = msg.guild.id;

        if(botUtils.checkAuth(msg)) {
          await recordService
          .getStatisticOfGameAllMember(guild_id, date, msg)
          .then((result) => {
              // msg.reply(result);
          })
          .catch((err) => {
            console.log(err);
            msg.reply(err.message);
          });
        } else {
          return msg.reply("권한 없음");
        }

    },
  },
  
];
