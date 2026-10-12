const toggle = require("./../toggle");
const settings = require("./../settings");

class Spider {

    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        let speed = settings.spider_speed

        player.on('serverbound', ({name, params}) => {
            if (!toggle.spider) return;

            if (name !== 'player_auth_input') return;

            const inputs = params.input_data ?? [];
            if (!inputs.includes("horizontal_collision")) return;
            if (inputs.includes("vertical_collision")) return;

            const dy = params.delta?.y ?? 0;
            if (dy > speed) return;

            player.queue('set_entity_motion', {
                runtime_entity_id: this.localPlayer.runtimeEntityId,
                tick: params.tick,
                velocity: {
                    x: this.localPlayer.motionX,
                    y: speed,
                    z: this.localPlayer.motionZ
                }
            });
        });
    }
}

module.exports = Spider