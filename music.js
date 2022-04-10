const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

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
		adapterCreator: channel.guild.voiceAdapterCreator,
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
    const songQueue = getQueue(guild.id);

    if (!song) {
        songQueue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    };

    const stream = ytdl(song.url, {filter: "audioonly"});

    songQueue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on("finish", () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    });

    await songQueue.textChannel.send(`Now playing **${song.title}**`);
};

music.play = async function(client, msg, msgContent) {
    const memberVc = checkVc(msg);

    if (memberVc) {
        const serverQueue = getQueue(msg.guild.id);
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
                songs: []
            };

            queue.set(msg.guild.id, queueConstructor);
            queueConstructor.songs.push(song);

            try {
                const connection = await joinVc(memberVc);
                queueConstructor.connection = connection;
                videoPlayer(msg.guild, queueConstructor.songs[0]);
            } catch (err) {
                queue.delete(msg.guild.id);
                msg.channel.send("There was an error connecting!");
                console.log(err);
            };
        } else{
            serverQueue.songs.push(song);
            msg.channel.send(`**${song.title}** added to queue!`);
        };
    };
};

music.skip = function(client, msg, msgContent) {

};

music.jump = function(client, msg, msgContent) {

};

music.loop = function(client, msg, msgContent) {

};

music.stop = function(client, msg, msgContent) {

};

music.queue = function(client, msg, msgContent) {

};

module.exports = music;
