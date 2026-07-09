const toggle = require('./../modules/toggle');

class Toggle {
    constructor(player) {
        this.player = player

        player.on('serverbound', ({name, params}, des) => {
            const module = Object.keys(toggle).find(
                key => `/${key.toLowerCase()}` === params.command
            );

            if (module !== undefined) {
                des.canceled = true;
                toggle[module] = !toggle[module];
                player.queue('text', {
                    type: 'system',
                    needs_translation: false,
                    source_name: '',
                    xuid: '',
                    platform_chat_id: '',
                    filtered_message: '',
                    message: `§l[§5MIHU PROXY§r§l]§r ${module} is ${toggle[module] ? '§aenabled' : '§cdisabled'}`
                });
            }
        })
    }
}

module.exports = Toggle
