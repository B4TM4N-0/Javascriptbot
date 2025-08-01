const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch'); // For Node 18 or lower

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

  // .search {gamename}
  if (content.startsWith('.search ')) {
    const gameName = msg.content.slice(8).trim();

    if (!gameName) {
      return msg.reply('Please provide a game name. Usage: `.search <game>`');
    }

    try {
      const res = await fetch(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(gameName)}`);
      const data = await res.json();
      const scripts = data.result.scripts;

      if (!scripts || scripts.length === 0) {
        return msg.reply('No scripts found.');
      }

      const pageSize = 5;
      let page = 0;

      const buildEmbed = () => {
        const start = page * pageSize;
        const end = start + pageSize;
        const currentScripts = scripts.slice(start, end);

        const embed = new EmbedBuilder()
          .setTitle(`Search results for "${gameName}"`)
          .setColor(0x00AEFF)
          .setFooter({ text: `Page ${page + 1} of ${Math.ceil(scripts.length / pageSize)}` });

        currentScripts.forEach((s, i) => {
          embed.addFields({
            name: `${start + i + 1}. ${s.title}`,
            value: `Slug: ${s.slug}`,
          });
        });

        return embed;
      };

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀ Previous').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('next').setLabel('Next ▶').setStyle(ButtonStyle.Primary)
      );

      const message = await msg.channel.send({ embeds: [buildEmbed()], components: [row] });

      const collector = message.createMessageComponentCollector({ time: 60_000 });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== msg.author.id) {
          return interaction.reply({ content: 'These buttons aren’t for you.', ephemeral: true });
        }

        await interaction.deferUpdate();

        if (interaction.customId === 'next' && (page + 1) * pageSize < scripts.length) {
          page++;
        } else if (interaction.customId === 'prev' && page > 0) {
          page--;
        }

        await message.edit({ embeds: [buildEmbed()] });
      });

      collector.on('end', () => {
        message.edit({ components: [] }).catch(() => {});
      });

    } catch (err) {
      console.error('Script fetch failed:', err);
      msg.reply('❌ Failed to fetch scripts.');
    }

  } else if (content === '.lebron') {
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
