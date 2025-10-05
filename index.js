// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require('@discordjs/voice');
const path = require('path');

// === CONFIG ===
const TOKEN = process.env.TOKEN;
// Put your audio file (rickroll.mp3) in the same folder as this file

// === BOT SETUP ===
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
    // Ignore messages from bots
    if (message.author.bot) return;

    // The command to trigger the rickroll
    if (message.content === '!rickroll') {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('Join a voice channel first!');
        }

        try {
            // Connect to the voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: false, // important: bot can hear and play audio
            });

            // Create an audio player and load the resource
            const player = createAudioPlayer();
            const resource = createAudioResource(
                path.join(__dirname, 'rickroll.mp3')
            );

            player.play(resource);
            connection.subscribe(player);

            // Disconnect when done
            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();
            });

            message.reply("ok");
        } catch (error) {
            console.error(error);
            message.reply("Couldn't play the song. Check console for details.");
        }
    }
});

// === LOGIN ===
client.login(TOKEN);
