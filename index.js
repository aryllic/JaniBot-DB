require("dotenv").config();
const discord = require("discord.js");
const client = new discord.Client({intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_PRESENCES",
    "GUILD_VOICE_STATES",
    "DIRECT_MESSAGES"
]});
const commands = require("./commands.js");
const settings = require("./settings.js");

client.on("ready", function() {
    client.guilds.cache.forEach(guild => {
        settings.new(guild.id);
    });

    client.user.setActivity("-cmds", {
        type: "STREAMING",
        url: "https://www.twitch.tv/discord"
    });

    console.log("The bot is ready!");
});

/*client.on("presenceUpdate", function(presence) {
    const member = presence.guild.members.cache.get(presence.userId);

    if (presence.activities && presence.activities[0]) {
        if (presence.activities[0].name.match("League of Legends") && member.user.username == "Aim_Katze_AT") {
            member.user.send("Hör auf League of Legends zu spielen!");
        };
    };
});*/

client.on("guildCreate", function(guild) {
    settings.new(guild.id);
});

client.on("messageCreate", function(msg) {
    if (!msg.author.bot) {
        if (msg.content.slice(0, settings.get(msg.guild.id).prefix.length) == settings.get(msg.guild.id).prefix) {
            let msgContent = msg.content.slice(settings.get(msg.guild.id).prefix.length, msg.content.length).split(" ");
            let cmd = commands.findCmd(msgContent[0]);

            if (cmd) {
                if (cmd.neededRoles) {
                    let neededStrings = [];

                    cmd.neededRoles.forEach(roleName => {
                        neededStrings.push(roleName + "RoleId");
                    });

                    neededStrings.forEach(string => {
                        if (settings.get(msg.guild.id)[string]) {
                            if (!msg.member.roles.cache.has(settings.get(msg.guild.id)[string])) {
                                if (neededStrings) {
                                    msg.channel.send("You do not have the required role(s) to use this command!");
                                };
                                
                                neededStrings = null;                                
                            };
                        } else {
                            if (neededStrings) {
                                msg.channel.send("You need to set a(n) " + cmd.neededRoles[neededStrings.indexOf(string)] + " role to use this command!");
                            };

                            neededStrings = null;
                        };
                    });

                    if (neededStrings) {
                        cmd.func(client, msg, msgContent);
                    };
                } else {
                    cmd.func(client, msg, msgContent);
                };
            } else {
                msg.channel.send("Sorry! I couldn't find the command you were looking for.");
            };
        };
    };
});

client.on("voiceStateUpdate", async function(oldVoiceState, newVoiceState) {
    const indienUsersArray = settings.get(newVoiceState.guild.id).indienUsers;

    if (newVoiceState.channel) {
        indienUsersArray.forEach(id => {
            if (id == newVoiceState.member.user.id) {
                if (newVoiceState.channel.id != settings.get(newVoiceState.guild.id).indienChannel) {
                    newVoiceState.member.voice.setChannel(settings.get(newVoiceState.guild.id).indienChannel);
                };
            };
        });
    };
});

client.login(process.env.DISCORD_BOT_TOKEN);
