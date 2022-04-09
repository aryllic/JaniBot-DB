require("dotenv").config();
const discord = require("discord.js");
const client = new discord.Client({intents: [
    "GUILDS",
    "GUILD_MESSAGES"
]});

const commands = require("./commands.js");

/*client.guilds.forEach(guild => {

});*/

client.on("ready", function() {
    console.log("Bot started!");
});

client.on("messageCreate", function(msg) {
    if (!msg.author.bot) {
        if (msg.content.slice(0, process.env.PREFIX.length) == process.env.PREFIX) {
            let msgContent = msg.content.slice(process.env.PREFIX.length, msg.content.length).split(" ");
            let cmd = commands.findCmd(msgContent[0]);

            if (cmd) {
                if (cmd.needsMod) {

                } else {
                    cmd.func(msg, msgContent);
                };
            } else {
                msg.reply("Sorry! I couldn't find the command you were looking for.");
            };
        };
    };
});

client.login(process.env.DISCORD_BOT_TOKEN);
