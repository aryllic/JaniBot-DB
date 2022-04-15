const { MessageEmbed, Permissions } = require("discord.js");
const music = require("./music.js");
const settings = require("./settings.js");

const commands = [];
const fakten = [
    "Martin stinkt.",
    "Klaus stinkt.",
    "Paula stinkt.",
    "Fun Fact: David stinkt so sehr, dass er nach Indien verbannt wurde!",
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
    `**David:** 'So, ich hab den Jan jetzt auf null!'
**Auch David:** *verschwindet nach Indien*`,
    "Ich bin lustiger als David!",
    "Fun Fact: Deine Mutter hat dich absichtlich im Baumarkt vergessen, weil du so hässlich bist!",
    "David hör auf Deine-Mutter-Witze zu machen. Es ist nicht mehr 2016.",
    "https://cdn.discordapp.com/attachments/835902547255361566/836967730602049636/unknown.png",
    "https://cdn.discordapp.com/attachments/835898456621973524/835905209045090314/Garfunkel.mp4",
    "Du hast unglaublich viel Glück, diesen Fakt gefunden zu haben."
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
            }
        };
    });

    return foundCmd;
};

createCmd("cmds", "Returns all the commands this bot has available.", ["help"], null, function(client, msg, msgContent) {
    let msgDesc = "";

    commands.forEach(cmd => {
        msgDesc = msgDesc + cmd.name + ": " + cmd.desc + "\n\n"
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

createCmd("fakt", "Tells you a fact.", [], null, function(client, msg, msgContent) {
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

createCmd("setstream", "Sets the activity of the bot.", [], ["admin"], function(client, msg, msgContent) {
    if (msgContent[1]) {
        let joinedContent = msgContent.join(" ");
        let setString = joinedContent.slice(10, joinedContent.length);

        client.user.setActivity(setString, {
            type: "STREAMING",
            url: "https://www.twitch.tv/discord"
        });
    };
});

module.exports = commands;
