const LocalPlayer = require("../../entity/LocalPlayer");
const toggle = require("./../toggle");

class Fullbright {
    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        player.on('serverbound', ({ name, params }, des) => {
            if (!toggle.fullbright) {
                player.queue('mob_effect', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: 0n,
                    event_id: 'remove',
                    particles: false,
                    duration: 360000,
                    amplifier: 0,
                    effect_id: 16
                })
                return
            }

            if (name === 'player_auth_input') {
                player.queue('mob_effect', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: 0n,
                    event_id: 'add',
                    particles: false,
                    duration: 360000,
                    amplifier: 0,
                    effect_id: 16 //NIGHT_VISION
                })
            }
        })
    }
}

module.exports = Fullbright
