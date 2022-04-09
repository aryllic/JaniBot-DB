const { MessageEmbed } = require("discord.js");

commands = [];
fakten = [
    "Martin stinkt.",
    "Klaus stinkt.",
    "Paula stinkt.",
    "Fun Fact: David stinkt so sehr, dass er nach Indien verbannt wurde!",
    "Sind die Hühner platt wie Teller, war der Traktor wieder schneller.",
    "Lieber ein Schitzel am Teller, als bei Fritzl im Keller.",
    "Wenn man mit Schulden stirbt, hat man Gewinn gemacht.",
    "Wer anderen eine Grube gräbt muss aufpassen, dass man nicht über 3m³ Aushub kommt, sonst braucht man eine Baugenehmigung.",
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
    }
}

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
    
    msg.reply({embeds: [msgEmbed]});
});

createCmd("repeat", "Repeats everything you say.", false, function(client, msg, msgContent) {
    if (msgContent[1]) {
        let joinedContent = msgContent.join(" ");
        let replyString = joinedContent.slice(7, joinedContent.length);

        msg.reply(replyString);
    };
});

createCmd("fakt", "Tells you a fact.", false, function(client, msg, msgContent) {
    msg.reply(fakten[Math.floor(Math.random() * fakten.length)]);
});

createCmd("setstream", "Sets the activity of the bot.", false, function(client, msg, msgContent) {
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