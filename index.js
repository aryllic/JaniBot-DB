require("dotenv").config();
const discord = require("discord.js");
const client = new discord.Client({intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_PRESENCES",
    "DIRECT_MESSAGES"
]});

const commands = require("./commands.js");

client.on("ready", function() {
    console.log("Bot started!");

    client.user.setActivity("-cmds", {
        type: "STREAMING",
        url: "https://www.twitch.tv/discord"
    });
});

/*client.on("presenceUpdate", function(presence) {
    const member = presence.guild.members.cache.get(presence.userId);

    if (presence.activities && presence.activities[0]) {
        if (presence.activities[0].name.match("League of Legends") && member.user.username == "Aim_Katze_AT") {
            member.user.send("Hör auf League of Legends zu spielen!");
        };
    };
});*/

client.on("messageCreate", function(msg) {
    if (!msg.author.bot) {
        if (msg.content.slice(0, process.env.PREFIX.length) == process.env.PREFIX) {
            let msgContent = msg.content.slice(process.env.PREFIX.length, msg.content.length).split(" ");
            let cmd = commands.findCmd(msgContent[0]);

            if (cmd) {
                if (cmd.needsMod) {

                } else {
                    cmd.func(client, msg, msgContent);
                };
            } else {
                msg.reply("Sorry! I couldn't find the command you were looking for.");
            };
        };
    };
});

client.login(process.env.DISCORD_BOT_TOKEN);
