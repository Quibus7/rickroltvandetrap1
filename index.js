// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  getVoiceConnection
} = require('@discordjs/voice');
const path = require('path');

// === CONFIG ===
// The token is stored safely as an environment variable on Render.
const TOKEN = process.env.TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// === READY EVENT ===
client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

// === MESSAGE HANDLER ===
client.on('messageCreate', async (message) => {
  // Ignore other bots
  if (message.author.bot) return;

  // === !rickroll command ===
  if (message.content === '!rickroll') {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a voice channel first!');

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource(path.join(__dirname, 'rickroll.mp3'));

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      message.reply("🎶 Never gonna give you up!");
    } catch (error) {
      console.error(error);
      message.reply("Couldn't play the song. Check console for details.");
    }
  }

  // === !stop command ===
  if (message.content === '!stop') {
    const guildId = message.guild.id;
    const connection = getVoiceConnection(guildId);

    if (connection) {
      connection.destroy();
      message.reply("🛑 RickBot has stopped and left the voice channel.");
    } else {
      message.reply("I'm not in a voice channel right now.");
    }
  }
});

// === LOGIN ===
client.login(TOKEN);

