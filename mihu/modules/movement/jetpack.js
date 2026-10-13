const toggle = require("./../toggle");
const settings = require("../settings");

class Jetpack {
    constructor (player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        player.on('serverbound', ({ name, params }) => {
            if (!toggle.jetpack) return;

            if (name === 'player_auth_input') {

                let speed = settings.jetpack_speed
                let calcYaw = (localPlayer.yaw + 90) * (Math.PI / 180)
                let calcPitch = (localPlayer.pitch) * -(Math.PI / 180)

                player.queue('set_entity_motion', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: params.tick,
                    velocity: {
                        x: Math.cos(calcYaw) * Math.cos(calcPitch) * speed,
                        y: Math.sin(calcPitch) * speed,
                        z: Math.sin(calcYaw) * Math.cos(calcPitch) * speed,
                    }
                })
            }
        })
    }
}

module.exports = Jetpack