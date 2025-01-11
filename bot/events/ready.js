const { Events } = require('discord.js');

// 디코 실행 시 이벤트
module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
    }
}