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
            return false;
        };

        return memberVc;
    };
};

async function checkConnection(c, guildId) {
    c.on(VoiceConnectionStatus.Disconnected, async function () {
        const serverQueue = getQueue(guildId);

        if (serverQueue && serverQueue.connection) {
            serverQueue.connection.destroy();
            serverQueue.connection = null;

            const newConnection = await joinVc(serverQueue.voiceChannel);
            serverQueue.connection = newConnection;

            if (serverQueue.player && serverQueue.playing) {
                serverQueue.connection.subscribe(serverQueue.player);
            };

            checkConnection(newConnection, guildId);
        };
    });
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
		throw error;
	};
};

const videoPlayer = async function(guild, song) {
    const serverQueue = getQueue(guild.id);
    serverQueue.player = createAudioPlayer({behaviors: { noSubscriber: NoSubscriberBehavior.Pause, maxMissedFrames: 10000 }});

    if (!song) {
        if (serverQueue.connection) {
            serverQueue.connection.destroy();
            serverQueue.connection = null;
        };

        serverQueue.playing = false;
        return;
    };

    const stream = ytdl(song.url, { filter: "audioonly" });
    const resource = createAudioResource(stream);

    await serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);
    serverQueue.playing = true;

    const msgEmbed = new MessageEmbed()
        .setColor("#4ec200")
        .setTitle("Now playing:")
        .setDescription(song.title);

    serverQueue.textChannel.send({ embeds: [msgEmbed] });

    serverQueue.player.on('error', error => {
        console.log(`Audio-Player-Error: ${error.message}`);
    });

    serverQueue.player.on(AudioPlayerStatus.Idle, async function() {
        serverQueue.playing = false;
        
        if (serverQueue.looping == "Queue") {
            serverQueue.songs.push(serverQueue.songs[0]);
            serverQueue.songs.shift();
        } else if (!serverQueue.looping) {
            serverQueue.songs.shift();
        };

        videoPlayer(guild, serverQueue.songs[0]);
    });
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
            const joinedContent = slicedContent.join(" ");
            const video = await videoFinder(joinedContent);

            if (video){
                song = {
                    title: video.title,
                    url: video.url
                };
            } else {
                msg.channel.send("I couldn't find the song you were looking for!");
            };
        };

        if (!serverQueue) {
            const queueConstructor = {
                voiceChannel: memberVc,
                textChannel: msg.channel,
                connection: null,
                player: null,
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

                checkConnection(connection, msg.guild.id);

                serverQueue.songs.push(song);
                videoPlayer(msg.guild, serverQueue.songs[0]);
            } catch (err) {
                //queue.delete(msg.guild.id);
                serverQueue.textChannel.send("There was an error connecting!");
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

                await serverQueue.textChannel.send({ embeds: [msgEmbed] });
            };
        };
    };
};

music.skip = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue && serverQueue.playing) {
       if (serverQueue.player) {
           serverQueue.player.stop();
       };
    } else {
        msg.channel.send("There is no song playing to skip!");
    };
};

music.jump = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue) {
        let slicedContent = msgContent;
        slicedContent.shift();
        const joinedContent = slicedContent.join(" ");
        
        let foundSong = null;

        serverQueue.songs.forEach(song => {
            if (song.title.toLowerCase().match(joinedContent.toLowerCase())) {
                foundSong = song;
            };
        });
        
        if (!foundSong) {
            serverQueue.textChannel.send("I couldn't find the song you were looking for!");
        } else {
            while (true) {
                if (serverQueue.songs[1] && serverQueue.songs.indexOf(foundSong) != 1) {
                    serverQueue.songs.push(serverQueue.songs[0]);
                    serverQueue.songs.shift();
                } else {
                    break;
                };
            };

            if (serverQueue.looping != "Queue" && serverQueue.looping != "Song") {
                serverQueue.songs.push(serverQueue.songs[0]);
            };

            if (serverQueue.playing && serverQueue.player) {
                serverQueue.player.stop();
            } else {
                serverQueue.songs.shift();
                videoPlayer(msg.guild, serverQueue.songs[0]);
            };

            const msgEmbed = new MessageEmbed()
                    .setColor("#4ec200")
                    .setTitle("Jumping to song:")
                    .setDescription(foundSong.title);

            serverQueue.textChannel.send({ embeds: [msgEmbed] });
        };
    } else {
        msg.channel.send("There is no song queue so I can switch songs!");
    };
};

music.seek = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue && serverQueue.playing) {
        msg.channel.send("Sorry! I am still working on this command. :(");
    } else {
        msg.channel.send("There is no song playing to forward!");
    };
};

music.shuffle = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue && serverQueue.playing && serverQueue.songs.length > 0) {
        let currentIndex = serverQueue.songs.length, randomIndex;
        let playingSong = serverQueue.songs[0]

        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          [serverQueue.songs[currentIndex], serverQueue.songs[randomIndex]] = [
            serverQueue.songs[randomIndex], serverQueue.songs[currentIndex]];
        };

        serverQueue.songs.forEach(song => {
            if (song.title.toLowerCase().match(playingSong.title.toLowerCase())) {
                playingSong = song;
            };
        });

        const playingSongIndex = serverQueue.songs.indexOf(playingSong);

        [serverQueue.songs[playingSongIndex], serverQueue.songs[0]] = [
            serverQueue.songs[0], serverQueue.songs[playingSongIndex]];

        serverQueue.textChannel.send("Shuffled the song queue!");

        serverQueue.player.stop();
    } else {
        msg.channel.send("There is no song queue so I can shuffle songs!");
    };
};

music.loop = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue) {
        if (!serverQueue.looping) {
            serverQueue.looping = "Queue";
            serverQueue.textChannel.send("Now looping the queue!");
        } else if (serverQueue.looping == "Queue") {
            serverQueue.looping = "Song";
            serverQueue.textChannel.send("Now looping the current song!");
        } else {
            serverQueue.looping = false;
            serverQueue.textChannel.send("Looping is now disabled!");
        };
    } else {
        msg.channel.send("There is no song queue to loop!");
    };
};

music.remove = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue) {
        let slicedContent = msgContent;
        slicedContent.shift();
        const joinedContent = slicedContent.join(" ");
        
        let foundSong = null;

        serverQueue.songs.forEach(song => {
            if (song.title.toLowerCase().match(joinedContent.toLowerCase())) {
                foundSong = song;
            };
        });
        
        if (!foundSong) {
            serverQueue.textChannel.send("I couldn't find the song you were looking for!");
        } else {
            if (serverQueue.player && serverQueue.playing) {
                if (serverQueue.songs.indexOf(foundSong) == 0) {
                    if (serverQueue.looping == "Queue" || serverQueue.looping == "Song") {
                        serverQueue.songs.shift();
                        serverQueue.player.stop();
                    } else {
                        serverQueue.player.stop();
                    };
                } else {
                    serverQueue.songs.splice(serverQueue.songs.indexOf(foundSong), 1);
                };

                const msgEmbed = new MessageEmbed()
                    .setColor("#4ec200")
                    .setTitle("Removed:")
                    .setDescription(foundSong.title);

                serverQueue.textChannel.send({ embeds: [msgEmbed] });
            };
        };
    } else {
        msg.channel.send("There is no song queue so I can remove songs!");
    };
};

music.stop = function(client, msg, msgContent) {
    const serverQueue = getQueue(msg.guild.id);

    if (serverQueue && serverQueue.playing) {
       if (serverQueue.player) {
           serverQueue.songs = [];
           serverQueue.player.stop();
       };
    } else {
        msg.channel.send("I am not playing any songs!");
    };
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
