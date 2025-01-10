const recordHandler = require('../handler/recordHandler');
const { getMemberNick } = require('../botUtils');   

module.exports = [
    {
        name: '전적',
        run: (client, msg, args) => {
            const riot_name = getMemberNick(msg, args);
            const guild_id = msg.guild.id;

            recordHandler.searchRecord(riot_name, guild_id)
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
        name: '장인',
        run: (client, msg, args) => {
            msg.reply('장인검색완료');
        }
    }
];
