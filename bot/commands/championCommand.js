const championService = require("../../app/services/championService");
const botUtils = require("../botUtils");

// 전적 검색 명령어
module.exports = [
  {
    name: "장인",
    run: async (client, msg, args) => {
      const champ_name = args.join(" ").replace(/\s/g, "").trim();
      const guild_id = msg.guild.id;

      await championService
        .getMasterOfChampion(champ_name, guild_id)
        .then((result) => {
          msg.reply(botUtils.createEmbed(result));
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });
    },
  },
];
