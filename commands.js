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

function createCmd(name, desc, needsMod, func) {
    commands[commands.length + 2] = {
        name: name,
        desc: desc,
        needsMod: needsMod,
        func: func
    };
};

commands.findCmd = function(name) {
    let foundCmd = false;

    commands.forEach(cmd => {
        if (cmd.name && cmd.name == name) {
            foundCmd = cmd;
        };
    });

    return foundCmd;
};

createCmd("cmds", "Returns all the commands this bot has available.", false, function(client, msg, msgContent) {
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

createCmd("repeat", "Repeats everything you say.", false, function(client, msg, msgContent) {
    if (msgContent[1]) {
        let joinedContent = msgContent.join(" ");
        let replyString = joinedContent.slice(7, joinedContent.length);

        msg.channel.send(replyString);
    };
});

createCmd("fakt", "Tells you a fact.", false, function(client, msg, msgContent) {
    msg.channel.send(fakten[Math.floor(Math.random() * fakten.length)]);
});

createCmd("p", "Plays the song you're looking for.", true, function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.play(client, msg, msgContent);
    };
});

createCmd("skip", "Skips the current song.", true, function(client, msg, msgContent) {
    music.skip(client, msg, msgContent);
});

createCmd("jump", "Jumps to the song you're looking for.", true, function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.jump(client, msg, msgContent);
    };
});

createCmd("loop", "Loops the queue.", true, function(client, msg, msgContent) {
    music.loop(client, msg, msgContent);
});

createCmd("r", "Removes the song you're looking for.", true, function(client, msg, msgContent) {
    if (msgContent[1]) {
        music.remove(client, msg, msgContent);
    };
});

createCmd("stop", "Stops the groove.", true, function(client, msg, msgContent) {
    music.stop(client, msg, msgContent);
});

createCmd("q", "Displays all of the songs in the queue.", false, function(client, msg, msgContent) {
    music.queue(client, msg, msgContent);
});

createCmd("setmodrole", "Sets the moderator role.", false, function(client, msg, msgContent) {
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

createCmd("setprefix", "Sets the prefix of the bot.", true, function(client, msg, msgContent) {
    if (msgContent[1]) {
        settings.setValue(msg.guild.id, "prefix", msgContent[1]);
        msg.channel.send("I set the prefix to: " + settings.get(msg.guild.id).prefix);
    };
});

createCmd("setstream", "Sets the activity of the bot.", true, function(client, msg, msgContent) {
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
