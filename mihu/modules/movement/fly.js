const toggle = require("./../toggle");
const settings = require("./../settings");

class Fly {
    constructor(player, localPlayer) {
        this.player = player;
        this.localPlayer = localPlayer;
        let lastMotionTime = 0;

        player.on('serverbound', ({ name, params }) => {
            if (!toggle.fly) return;
            if (name !== 'player_auth_input') return;

            const motionInterval = 50;
            const verticalSpeed = settings.fly_verticalSpeed;
            const horizontalSpeed = settings.fly_horizontalSpeed;

            if (Date.now() - lastMotionTime < motionInterval) return;

            const inputs = params.input_data ?? [];

            const isMoving =
                inputs.includes("up")         ||
                inputs.includes("down")       ||
                inputs.includes("left")       ||
                inputs.includes("right")      ||
                inputs.includes("up_left")    ||
                inputs.includes("up_right")   ||
                inputs.includes("down_left")  ||
                inputs.includes("down_right");

            const wantUp   = inputs.includes("jumping")   || inputs.includes("want_up");
            const wantDown = inputs.includes("sneaking")  || inputs.includes("want_down");
            const isVertical = wantUp || wantDown;

            let moveX = 0, moveZ = 0, vertical = 0;

            if (isMoving) {
                const yaw = localPlayer.yaw * (Math.PI / 180);

                const forwardX = -Math.sin(yaw) * horizontalSpeed;
                const forwardZ =  Math.cos(yaw) * horizontalSpeed;
                const rightX   = -Math.cos(yaw) * horizontalSpeed;
                const rightZ   = -Math.sin(yaw) * horizontalSpeed;

                if (inputs.includes("up"))    { moveX += forwardX; moveZ += forwardZ; }
                if (inputs.includes("down"))  { moveX -= forwardX; moveZ -= forwardZ; }
                if (inputs.includes("right")) { moveX += rightX;   moveZ += rightZ;   }
                if (inputs.includes("left"))  { moveX -= rightX;   moveZ -= rightZ;   }

                if (inputs.includes("up_left"))    { moveX += forwardX - rightX; moveZ += forwardZ - rightZ; }
                if (inputs.includes("up_right"))   { moveX += forwardX + rightX; moveZ += forwardZ + rightZ; }
                if (inputs.includes("down_left"))  { moveX -= forwardX + rightX; moveZ -= forwardZ + rightZ; }
                if (inputs.includes("down_right")) { moveX -= forwardX - rightX; moveZ -= forwardZ - rightZ; }

                const len = Math.hypot(moveX, moveZ);
                if (len > 0) {
                    moveX = (moveX / len) * horizontalSpeed;
                    moveZ = (moveZ / len) * horizontalSpeed;
                }
            }

            if (wantUp)        vertical =  verticalSpeed;
            else if (wantDown) vertical = -verticalSpeed;

            player.queue('set_entity_motion', {
                runtime_entity_id: this.localPlayer.runtimeEntityId,
                tick: params.tick,
                velocity: { x: moveX, y: vertical, z: moveZ }
            });

            lastMotionTime = Date.now();
        });
    }
}

module.exports = Fly;