const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>HELLOOOOOOOOO</h1>');
});

app.get('/status', (req, res) => {
  res.json({ status: 'online', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  const content = msg.content.toLowerCase();
  if (!content.startsWith('.')) return;

  if (content === '.lebron') {
    msg.channel.send('https://tenor.com/qyUw9qEpXlb.gif');
  } else if (content === '.status') {
    msg.channel.send(`✅ Bot is online on port ${PORT}`);
  } else if (content === '.ping') {
    const latency = Date.now() - msg.createdTimestamp;
    msg.channel.send(`🏓 Pong! Latency: ${latency}ms`);
  } else if (content === '.uptime') {
    const totalSeconds = Math.floor(process.uptime());
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');

    msg.channel.send(`🕒 Uptime: \`${formatted}\``);
  }
});

client.login(process.env.DISCORD_TOKEN);