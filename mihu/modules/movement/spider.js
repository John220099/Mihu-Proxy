const LocalPlayer = require("../../entity/LocalPlayer");
const toggle = require("./../toggle");

class Spider {

    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        player.on('serverbound', ({ name, params }, des) => {
            if (!toggle.spider) return;

            if (name === 'player_auth_input' && params.input_data.horizontal_collision) {
                player.write('set_entity_motion', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: params.tick,
                    velocity: {
                        x: this.localPlayer.motionX,
                        y: 0.5,
                        z: this.localPlayer.motionZ,
                    }
                })
            }
        })
    }
}

module.exports = Spider
