const { Client, Collection, GatewayIntentBits, Partials} = require('discord.js');
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const prefix = '!';
const fs = require('node:fs');
const path = require('node:path');

// 디스코드 설정
const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });
  
client.commands = new Collection();

// command 로드
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const commands = require(filePath);
    // client.commands.set(command.name, command);
    commands.forEach(command => {
        client.commands.set(command.name, command);
    });
}
console.log(client.commands.map(c => c.name).join(', ') + ' 명령어가 로드됨.')
  
// 준비
client.on('ready', () => console.log(`${client.user.tag} 에 로그인됨`));

client.on('messageCreate', msg => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;
    if (msg.content.slice(0, prefix.length) !== prefix) return;
  
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    let cmd = client.commands.get(command);
    if (cmd) cmd.run(client, msg, args);
  })

client.login(DISCORD_TOKEN);


  
  