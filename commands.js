commands = [];

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

createCmd("cmds", "Returns all the commands this bot has available.", false, function(msg, msgContent) {
    msg.reply("This is the only command yet!");
});

module.exports = commands;