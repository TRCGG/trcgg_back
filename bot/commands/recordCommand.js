const recordService = require("../../app/services/recordService");
const { getMemberNick, createEmbed, getPlayersEmbed } = require("../botUtils");

// 전적 검색 명령어
module.exports = [
  {
    name: "전적",
    run: async (client, msg, args) => {
      const [riot_name, riot_name_tag] = getMemberNick(msg, args);
      const guild_id = msg.guild.id;

      await recordService
      .getPlayerForSearch(riot_name, riot_name_tag, guild_id)
      .then(async (players) => {
        if(players.length > 1){
          const result = getPlayersEmbed(players);
          msg.reply(createEmbed(result));
        } else {
          await recordService
            .getAllRecord(players[0].riot_name, players[0].riot_name_tag, guild_id)
            .then((record) => {
              // msg.channel.send({embeds: [record]});
              msg.reply(createEmbed(record));
            })
            .catch((err) => {
              console.log(err);
              msg.reply(err.message);
          });
        }
      })
      .catch((err) => {
        console.log(err);
        msg.reply(err.message);
      })
    },
  },
  {
    name: "최근전적",
    run: async (client, msg, args) => {
      const [riot_name, riot_name_tag] = getMemberNick(msg, args);
      const guild_id = msg.guild.id;

      await recordService
      .getPlayerForSearch(riot_name, riot_name_tag, guild_id)
      .then(async (players) => {
        if(players.length > 1){
          const result = getPlayersEmbed(players);
          msg.reply(createEmbed(result));
        } else {
          await recordService
            .getRecentGamesByRiotName(players[0].riot_name, players[0].riot_name_tag, guild_id)
            .then((record) => {
              msg.reply(createEmbed(record));
            })
            .catch((err) => {
              console.log(err);
              msg.reply(err.message);
          });          
        }
      })
      .catch((err) => {
        console.log(err);
        msg.reply(err.message);
      })
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
          msg.reply(createEmbed(result));
        })
        .catch((err) => {
          console.log(err);
          msg.reply(err.message);
        });
    },
  },
];
