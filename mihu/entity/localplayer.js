class LocalPlayer {
    constructor(player) {
        this.player = player
        this.runtimeEntityId = 0n
        this.position = {x: 0, y: 0, z: 0}
        this.prevPosition = {x: 0, y: 0, z: 0}
        this.motionX = 0
        this.motionY = 0
        this.motionZ = 0
        this.rotation = {x: 0, y: 0, z: 0}

        player.on('clientbound', ({name, params}, des) => {
            if (name === 'start_game') {
                this.runtimeEntityId = BigInt(params.runtime_entity_id ?? 0)
            }
        })

        player.on('serverbound', ({name, params}, des) => {
            if (name === 'player_auth_input') {
                this.prevPosition.x = this.position.x
                this.prevPosition.y = this.position.y
                this.prevPosition.z = this.position.z

                this.position.x = params.position?.x ?? this.position.x
                this.position.y = params.position?.y ?? this.position.y
                this.position.z = params.position?.z ?? this.position.z

                this.motionX = this.position.x - this.prevPosition.x
                this.motionY = this.position.y - this.prevPosition.y
                this.motionZ = this.position.z - this.prevPosition.z

                this.rotation.x = params.rotation?.x ?? this.rotation.x
                this.rotation.y = params.rotation?.y ?? this.rotation.y
                this.rotation.z = params.rotation?.z ?? this.rotation.z
            }

            if (name === 'player_hotbar') {
                this.heldItemSlot = params.selected_slot;
            } else if (name === 'mob_equipment') {
                if (params.runtimeEntityId === this.runtimeEntityId) {
                    this.heldItemSlot = params.selected_slot;
                }
            }
        })

    }
}

module.exports = LocalPlayer