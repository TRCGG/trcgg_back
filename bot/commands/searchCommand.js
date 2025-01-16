const recordHandler = require('../handler/searchHandler');
const { getMemberNick } = require('../botUtil');   

// 전적 검색 명령어
module.exports = [
    {
        name: '전적',
        run: async (client, msg, args) => {
            const riot_name = getMemberNick(msg, args);
            const guild_id = msg.guild.id;

            await recordHandler.searchRecord(riot_name, guild_id)
                .then(result => {
                    // console.log(data);
                    // msg.channel.send({embeds: [result]});
                    msg.reply(result);
                })
                .catch(err => {
                    console.log(err);
                });

            // msg.reply(riot_name);
        },
    },
    {
        name: '최근전적',
        run: async (client, msg, args) => {
            const riot_name = getMemberNick(msg, args);
            const guild_id = msg.guild.id;

            await recordHandler.searchRecentRecord(riot_name, guild_id)
                .then(result => {
                    msg.reply(result);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    },
    {
        name: '결과',
        run: async (client, msg, args) => {
            const game_id = args[0];
            const guild_id = msg.guild.id;

            await recordHandler.searchGameResult(game_id, guild_id)
                .then(result => {
                    msg.reply(result);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    },
    {
        name: '장인',
        run: async (client, msg, args) => {
            const champ_name = args.join(" ").replace(/\s/g, "").trim();
            const guild_id = msg.guild.id;

            await recordHandler.searchChampMaster(champ_name, guild_id)
                .then(result => {
                    msg.reply(result);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
];
