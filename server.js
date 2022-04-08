const discord = require("discord.js");
const client = new discord.Client({intents: [
    "GUILDS",
    "GUILD_MESSAGES"
]});

client.on("ready", function() {
    console.log("Bot started!");
});

client.on("messageCreate", function(msg) {
    if (!msg.author.bot) {
        if (msg.content.slice(0, 1) == "-") {
            if (msg.content.match("👍")) {
                msg.react("👍");
            };
        };
    };

    console.log(msg.content.slice(0, 1))
});

client.login("ODcwNTczOTMzMTYwNzE0MjYx.YQOvKA.STKc-2np_l8uwlyNMTDyH0frwE4");
