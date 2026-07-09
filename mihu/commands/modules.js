const toggle = require('./../modules/toggle');

class Modules {
    constructor(player) {
        this.player = player

        player.on('serverbound', ({name, params}, des) => {

            if (params.command === '/modules') {
                des.canceled = true;
                let moduleList = '§l[§5MIHU PROXY§r§l]§r Modules Status:\n';
                Object.keys(toggle).forEach(module => {
                    const status = toggle[module] ? '§a✓ Enabled' : '§c✗ Disabled';
                    moduleList += `§7- §f${module}: ${status}\n`;
                });

                player.queue('text', {
                    type: 'system',
                    needs_translation: false,
                    source_name: '',
                    xuid: '',
                    platform_chat_id: '',
                    filtered_message: '',
                    message: moduleList.trim()
                });
            }
        })
    }
}

module.exports = Modules