const LocalPlayer = require("../../entity/LocalPlayer");
const toggle = require("./../toggle");

class Fly {

    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer
        let lastMotionTime = 0

        player.on('serverbound', ({ name, params }, des) => {
            if (!toggle.fly) return;

            let motionInterval = 50
            let verticalSpeed = 1

            if (name === 'player_auth_input') {
                if (Date.now() - lastMotionTime < motionInterval) return

                let vertical
                if (params.input_data.jump_down) {
                    vertical = verticalSpeed
                } else if (params.input_data.sneak_down) {
                    vertical = -verticalSpeed
                } else {
                    vertical = 0
                }

                const input = params.input_data
                const isMoving = input.up || input.down || input.left || input.right ||
                    input.up_left || input.up_right || input.down_left || input.down_right
                const isVertical = input.jump_down || input.sneak_down

                if (!isMoving && !isVertical) {
                    player.write('set_entity_motion', {
                        runtime_entity_id: this.localPlayer.runtimeEntityId,
                        tick: params.tick,
                        velocity: { x: 0, y: 0, z: 0 }
                    })
                    lastMotionTime = Date.now()
                    return
                }

                const motionX = isMoving ? localPlayer.motionX : 0
                const motionZ = isMoving ? localPlayer.motionZ : 0

                player.write('set_entity_motion', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: params.tick,
                    velocity: {
                        x: motionX,
                        y: vertical,
                        z: motionZ
                    }
                })
                lastMotionTime = Date.now()
            }
        })
    }
}

module.exports = Fly
