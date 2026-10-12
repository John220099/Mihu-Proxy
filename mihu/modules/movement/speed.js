const toggle = require("./../toggle");
const settings = require("./../settings");

class Speed {
    constructor(player, localPlayer) {
        this.player = player;
        this.localPlayer = localPlayer;
        let lastMotionTime = 0;
        const speed = settings.speed_speed;

        player.on('serverbound', ({ name, params }) => {
            if (!toggle.speed) return;
            if (name !== 'player_auth_input') return;

            const inputs = params.input_data ?? [];

            if (!inputs.includes("vertical_collision")) return;

            const motionInterval = 100;
            if (Date.now() - lastMotionTime < motionInterval) return;

            const isMoving =
                inputs.includes("up")         ||
                inputs.includes("down")       ||
                inputs.includes("left")       ||
                inputs.includes("right")      ||
                inputs.includes("up_left")    ||
                inputs.includes("up_right")   ||
                inputs.includes("down_left")  ||
                inputs.includes("down_right");

            let moveXs = 0, moveZs = 0;

            if (isMoving) {
                const yaw = localPlayer.yaw * (Math.PI / 180);

                const forwardX = -Math.sin(yaw) * speed;
                const forwardZ =  Math.cos(yaw) * speed;
                const rightX   = -Math.cos(yaw) * speed;
                const rightZ   = -Math.sin(yaw) * speed;

                if (inputs.includes("up"))    { moveXs += forwardX; moveZs += forwardZ; }
                if (inputs.includes("down"))  { moveXs -= forwardX; moveZs -= forwardZ; }
                if (inputs.includes("right")) { moveXs += rightX;   moveZs += rightZ;   }
                if (inputs.includes("left"))  { moveXs -= rightX;   moveZs -= rightZ;   }

                if (inputs.includes("up_left"))    { moveXs += forwardX - rightX; moveZs += forwardZ - rightZ; }
                if (inputs.includes("up_right"))   { moveXs += forwardX + rightX; moveZs += forwardZ + rightZ; }
                if (inputs.includes("down_left"))  { moveXs -= forwardX + rightX; moveZs -= forwardZ + rightZ; }
                if (inputs.includes("down_right")) { moveXs -= forwardX - rightX; moveZs -= forwardZ - rightZ; }

                const len = Math.hypot(moveXs, moveZs);
                if (len > 0) {
                    moveXs = (moveXs / len) * speed;
                    moveZs = (moveZs / len) * speed;
                }
            }

            player.queue('set_entity_motion', {
                runtime_entity_id: this.localPlayer.runtimeEntityId,
                tick: params.tick,
                velocity: {
                    x: moveXs,
                    y: params.delta?.y ?? 0,
                    z: moveZs,
                }
            });

            lastMotionTime = Date.now();
        });
    }
}

module.exports = Speed;