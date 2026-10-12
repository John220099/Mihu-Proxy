const toggle = require("./../toggle");

class AirJump {

    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        player.on('serverbound', ({name, params}) => {
            if (!toggle.airJump) return;

            if (name !== 'player_auth_input') return;

            const inputs = params.input_data ?? [];
            const vy = params.delta?.y ?? 0;

            const holdingJump = inputs.includes("jumping");
            const falling = vy <= -0.1 && !inputs.includes("vertical_collision");

            if (holdingJump && falling) {
                player.queue('set_entity_motion', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: params.tick,
                    velocity: {
                        x: this.localPlayer.motionX,
                        y: 0.42,
                        z: this.localPlayer.motionZ,
                    }
                });
            }
        });
    }
}

module.exports = AirJump