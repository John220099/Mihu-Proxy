const LocalPlayer = require("../../entity/LocalPlayer");
const toggle = require("./../toggle");

class AirJump {

    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        player.on('serverbound', ({ name, params }, des) => {
            if (!toggle.airJump) return;

            if (name === 'player_auth_input' && params.input_data.jump_down) {
                if (localPlayer.motionY < -0.2) { //prevent motion from going crazy
                    player.write('set_entity_motion', {
                        runtime_entity_id: this.localPlayer.runtimeEntityId,
                        tick: params.tick,
                        velocity: {
                            x: this.localPlayer.motionX,
                            y: 0.42,
                            z: this.localPlayer.motionZ,
                        }
                    })
                }
            }
        })
    }
}

module.exports = AirJump
