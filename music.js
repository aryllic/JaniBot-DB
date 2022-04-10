const { MessageEmbed } = require("discord.js");
const { joinVoiceChannel, entersState, createAudioResource, createAudioPlayer, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
require("libsodium-wrappers");

const music = [];
const queue = new Map();

function checkVc(msg) {
    const memberVc = msg.member.voice.channel;

    if (!memberVc) {
        msg.channel.send("You need to be in a voice channel to use this command!");
        return false;
    } else {
        const permissions = memberVc.permissionsFor(msg.client.user);

        if (!permissions.has("CONNECT")) {
            msg.channel.send("I dont have permissions to join this voice channel!");
            return false;
        };

        if (!permissions.has("SPEAK")) {
            msg.channel.send("I dont have permissions to speak in this voice channel!");
            return false
        };

        return memberVc;
    };
};

function getQueue(guildId) {
    return queue.get(guildId);
};

async function joinVc(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator
	});

	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	};
};

const videoPlayer = async function(guild, song) {
    const serverQueue = getQueue(guild.id);

    if (!song) {
        if (serverQueue.connection) {
            serverQueue.connection.destroy();
            serverQueue.connection = null;
        };

        serverQueue.resource = null;
        serverQueue.playing = false;
        return;
    };

    if (!serverQueue.connection) {
        return;
    };

    const stream = ytdl(song.url, { filter: "audioonly" });

    if (!serverQueue.resource) {
        serverQueue.resource = createAudioResource(stream);
    };

    await serverQueue.player.play(serverQueue.resource, { seek: 0, volume: 0.5 });
    serverQueue.connection.subscribe(serverQueue.player);
    serverQueue.playing = true;

    serverQueue.player.on('error', error => {
        console.log(`Audio-Player-Error: ${error.message}`);
    });

    serverQueue.player.on(AudioPlayerStatus.Idle, async function() {
        serverQueue.playing = false;
        
        if (serverQueue.looping == "Queue") {
            serverQueue.songs.push(serverQueue.songs[0]);
            serverQueue.songs.shift();
        } else if (serverQueue.looping == false) {
            serverQueue.songs.shift();
        };

        serverQueue.resource = null;
        videoPlayer(guild, serverQueue.songs[0]);
    });

    const msgEmbed = new MessageEmbed()
            .setColor("#4ec200")
            .setTitle("Now playing:")
            .setDescription(song.title);

    await serverQueue.textChannel.send({ embeds: [msgEmbed] });
};

music.play = async function(client, msg, msgContent) {
    const memberVc = checkVc(msg);

    if (memberVc) {
        let serverQueue = getQueue(msg.guild.id);
        let song = {};

        if (ytdl.validateURL(msgContent[1])) {
            const songInfo = await ytdl.getInfo(msgContent[1]);

            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url
            };
        } else {
            const videoFinder = async function(query) {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            };

            let slicedContent = msgContent;
            slicedContent.shift();
            let joinedContent = slicedContent.join(" ");
            const video = await videoFinder(joinedContent);

            if (video){
                song = {
                    title: video.title,
                    url: video.url
                };
            } else {
                msg.channel.send("I couldn't find the video you were looking for!");
            };
        };

        if (!serverQueue) {
            const queueConstructor = {
                voiceChannel: memberVc,
                textChannel: msg.channel,
                connection: null,
                resource: null,
                player: createAudioPlayer({behaviors: { noSubscriber: NoSubscriberBehavior.Pause }}),
                playing: false,
                looping: false,
                songs: []
            };

            queue.set(msg.guild.id, queueConstructor);
            serverQueue = getQueue(msg.guild.id);
        };

        if (!serverQueue.connection) {
            try {
                const connection = await joinVc(memberVc);
                serverQueue.connection = connection;
                serverQueue.songs.push(song);
                videoPlayer(msg.guild, serverQueue.songs[0]);
            } catch (err) {
                queue.delete(msg.guild.id);
                msg.channel.send("There was an error connecting!");
                console.log(err);
            };
        } else {
            if (!serverQueue.playing) {
                serverQueue.songs.push(song);
                videoPlayer(msg.guild, serverQueue.songs[0]);
            } else {
                serverQueue.songs.push(song);

                const msgEmbed = new MessageEmbed()
                    .setColor("#4ec200")
                    .setTitle("Added to queue:")
                    .setDescription(song.title);

                await songQueue.textChannel.send({ embeds: [msgEmbed] });
            };
        };
    };
};

music.skip = function(client, msg, msgContent) {

};

music.jump = function(client, msg, msgContent) {

};

music.loop = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue) {
        if (!serverQueue.looping) {
            serverQueue.looping = "Queue";
            serverQueue.textChannel.send("Now looping the queue!");
        } else {
            serverQueue.looping = false;
            serverQueue.textChannel.send("Looping is now disabled!");
        };
    } else {
        msg.channel.send("There is no song queue to loop!");
    };
};

music.stop = function(client, msg, msgContent) {

};

music.queue = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);
    
    if (serverQueue) {
        let msgDesc = "";

        serverQueue.songs.forEach(song => {
            msgDesc = msgDesc + song.title + "\n\n"
        });

        const msgEmbed = new MessageEmbed()
            .setColor("#4ec200")
            .setTitle("Queue:")
            .setDescription(msgDesc);

        msg.channel.send({ embeds: [msgEmbed] });
    } else {
        msg.channel.send("There is no song queue!");
    };
};

module.exports = music;
