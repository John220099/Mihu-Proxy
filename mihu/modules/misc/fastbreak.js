const toggle = require("./../toggle");
const settings = require("./../settings");

class FastBreak {
    constructor(player, localPlayer) {
        this.player = player
        this.localPlayer = localPlayer

        this.speed = settings.fastbreak_speed

        player.on('serverbound', ({ name, params }, des) => {
            if (!toggle.fastbreak) {
                player.queue('mob_effect', {
                    runtime_entity_id: this.localPlayer.runtimeEntityId,
                    tick: 0n,
                    event_id: 'remove',
                    particles: false,
                    duration: 360000,
                    amplifier: 0,
                    effect_id: 3
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
                    amplifier: this.speed,
                    effect_id: 3 //HASTE
                })
            }
        })
    }
}

module.exports = FastBreak