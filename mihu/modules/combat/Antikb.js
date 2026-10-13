const toggle = require("./../toggle");

class Antikb {
    constructor(player) {
        this.player = player;

        this.listener = ({ name, params }) => {
            if (!toggle.antikb) return;

            if (name === 'set_entity_motion') {
                params.velocity = { x: 0, y: 0, z: 0 };
            }
        };

        player.on('clientbound', this.listener);
    }
}

module.exports = Antikb;