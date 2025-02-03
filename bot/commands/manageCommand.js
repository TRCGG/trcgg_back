const manageService = require("../../app/services/managementService");
const botUtils = require("../botUtils");

// 관리자 명령어
module.exports = [
  {
    name: "doc",
    run: async (client, msg, args) => {
      result = await manageService.getDoc();
      msg.reply(botUtils.createEmbed(result));
    },
  },
  {
    name: "부캐목록",
    run: async (client, msg, args) => {
      const guild_id = msg.guild.id;

      await manageService
        .getSubAccountList(guild_id)
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
    name: "부캐저장",
    run: async (client, msg, args) => {
      const command = args.join(" ").replace(/\s/g, "").trim();
      const guild_id = msg.guild.id;

      if (botUtils.checkAuth(msg)) {
        await manageService.postSubAccount(command, guild_id)
          .then((result) => {
            msg.reply(result);
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
  {
    name: "부캐삭제",
    run: async (client, msg, args) => {
      const full_sub_name = args[0].replace(/\s/g, "").trim();
      const guild_id = msg.guild.id;

      if (botUtils.checkAuth(msg)) {
        await manageService.deleteSubAccount(full_sub_name, guild_id)
          .then((result) => {
            msg.reply(result);
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
  {
    name: "탈퇴",
    run: async (client, msg, args) => {
      const full_riot_name = args[0].replace(/\s/g, "").trim();
      const delete_yn = "Y";
      const guild_id = msg.guild.id;
      if (botUtils.checkAuth(msg)) {
        await manageService.putDeleteYn(delete_yn, full_riot_name, guild_id)
          .then((result) => {
            msg.reply(result);
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
  {
    name: "복귀",
    run: async (client, msg, args) => {
      const full_riot_name = args[0].replace(/\s/g, "").trim();
      const delete_yn = "N";
      const guild_id = msg.guild.id;
      if (botUtils.checkAuth(msg)) {
        await manageService.putDeleteYn(delete_yn, full_riot_name, guild_id)
          .then((result) => {
            msg.reply(result);
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
  {
    name: "drop",
    run: async (client, msg, args) => {
      const game_id = args[0].trim();
      const guild_id = msg.guild.id;
      if (botUtils.checkAuth(msg)) {
        await manageService.deleteRecord(game_id, guild_id)
          .then((result) => {
            msg.reply(result);
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
  {
    name: "닉변",
    run: async (client, msg, args) => {
      const command_str = args.join(" ").replace(/\s/g, "").trim();
      const guild_id = msg.guild.id;

      if (botUtils.checkAuth(msg)) {
        await manageService.putPlayerName(command_str, guild_id)
          .then((result) => {
            msg.reply(result);
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
