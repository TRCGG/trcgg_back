const manageHandler = require('../handler/manageHandler');
const botUtil = require('../botUtil');   

// 전적 검색 명령어

module.exports = [
    {
      name: 'doc',
      run: async (client, msg, args) => {
        result =  await manageHandler.help();
        msg.reply(result);
      }
    },
    {
        name: '부캐목록',
        run: async (client, msg, args) => {
            const guild_id = msg.guild.id;

            await manageHandler.getSubAccountName(guild_id)
                .then(result => {
                    msg.reply(result);
                })
                .catch(err => {
                    console.log(err);
                });
        },
    },
    {
        name: '부캐저장',
        run: async (client, msg, args) => {
            const command = args.join(" ").replace(/\s/g, "").trim();
            const guild_id = msg.guild.id;
            if(botUtil.checkAuth(msg)) {
                result = await manageHandler.saveSubAccountName(command, guild_id);
                msg.reply(result);
            } else {
                return msg.reply("권한 없음");
            }
        }
    },
    {
        name: '부캐삭제',
        run: async (client, msg, args) => {
            const riot_name = args[0].replace(/\s/g, "").trim();
            const guild_id = msg.guild.id;
            if(botUtil.checkAuth(msg)) {
                result = await manageHandler.deleteSubAccountName(riot_name, guild_id);
                msg.reply(result);
            } else {
                return msg.reply("권한 없음");
            }
        }
    },
    {
        name: '탈퇴',
        run: async (client, msg, args) => {
            const riot_name = args[0].replace(/\s/g, "").trim();
            const delete_yn = 'Y';
            const guild_id = msg.guild.id;
            if(botUtil.checkAuth(msg)) {
                result = await manageHandler.putDeleteYn(delete_yn, riot_name, guild_id);
                msg.reply(result);
            } else {
                return msg.reply("권한 없음");
            }
        }
    },
    {
        name: '복귀',
        run: async (client, msg, args) => {
            const riot_name = args[0].replace(/\s/g, "").trim();
            const delete_yn = 'N';
            const guild_id = msg.guild.id;
            if(botUtil.checkAuth(msg)) {
                result = await manageHandler.putDeleteYn(delete_yn, riot_name, guild_id);
                msg.reply(result);
            } else {
                return msg.reply("권한 없음");
            }
        }
    },
    {
        name: 'drop',
        run: async (client, msg, args) => {
            const game_id = args[0].trim();
            const guild_id = msg.guild.id;
            if(botUtil.checkAuth(msg)) {
                result = await manageHandler.dropReplay(game_id, guild_id);
                msg.reply(result);
            } else {
                return msg.reply("권한 없음");
            }
        }
    },
    {
        name: '닉변',
        run: async (client, msg, args) => {
            const command = args.join(" ").replace(/\s/g, "").trim();
            const guild_id = msg.guild.id;
            if(botUtil.checkAuth(msg)) {
                result = await manageHandler.putNameAndSubAccountName(command, guild_id);
                msg.reply(result);
            } else {
                return msg.reply("권한 없음");
            }
        }
    }
];
