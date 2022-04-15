const settings = [];
const servers = new Map();

settings.new = function(guildId) {
    const serverConstructor = {
        prefix: "-",
        djRoleId: null,
        modRoleId: null,
        adminRoleId: null
    };

    servers.set(guildId, serverConstructor);
};

settings.get = function(guildId) {
    return servers.get(guildId);
};

settings.setValue = function(guildId, setting, value) {
    const serverSettings = settings.get(guildId);
    
    if (serverSettings) {
        serverSettings[setting] = value;
    }
};

/*settings.getValue = function(guildId, setting) {
    const serverSettings = setting.get(guildId);
    
    if (serverSettings) {
        return serverSettings[setting];
    };
};*/

module.exports = settings;
