const { Events } = require('discord.js');
const replayParseService = require('../../app/services/replayParsingService');

// 디코 메시지 발생 이벤트
module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(client, msg) {
        const prefix = "!";
        if (msg.author.bot) return;
        if (msg.attachments.size > 0) {

            const fileUrl = msg.attachments.first().url;
            const fileName = msg.attachments.first().name;
            const guildId = msg.guild.id;
            const createUser = msg.member.nickname || msg.author.username;

            // rofl 파일 아닌 경우 무시
            if (!fileName.endsWith('.rofl')) return;

            // rofl 확장자 제거
            const fileNameWithoutExt = fileName.endsWith('.rofl') ? fileName.slice(0, -5) : fileName;

            if (fileNameCheck(fileName)) {
                result = await replayParseService.save(fileUrl, fileNameWithoutExt, createUser, guildId);
                msg.reply(result);
            } else {
                msg.reply(`:red_circle:등록실패: ${fileNameWithoutExt} 잘못된 리플 파일 형식`)
            }

        } else { 
            if (!msg.content.startsWith(prefix)) return;
            if (msg.content.slice(0, prefix.length) !== prefix) return;
        
            const args = msg.content.slice(prefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();
            
            // if (!command) {
            //     msg.reply(`명령어 \`${commandName}\`를 찾을 수 없습니다.`);
            //     return;
            // }

            try {
                let cmd = client.commands.get(command);
                if (cmd) cmd.run(client, msg, args); // 명령어 실행
            } catch (error) {
                console.error(error);
                msg.reply("명령어 실행 중 오류가 발생했습니다.");
            }
        }
    }
}

// 리플 파일 정규식 검사
const fileNameCheck = (fileName) => {
    const regex = new RegExp(/^[a-zA-Z0-9]*_\d{4}_\d{4}\.rofl$/);
    return regex.test(fileName);s
}