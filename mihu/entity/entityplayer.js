class Player {
    constructor(playerData) {
        this.uuid = playerData.uuid || ''
        this.username = playerData.username || 'Unknown'
        this.runtimeId = BigInt(playerData.runtime_id ?? 0n)
        this.uniqueId = BigInt(playerData.unique_id ?? 0n)
        this.position = {
            x: playerData.position?.x ?? 0,
            y: playerData.position?.y ?? 0,
            z: playerData.position?.z ?? 0
        }
        this.velocity = {
            x: playerData.velocity?.x ?? 0,
            y: playerData.velocity?.y ?? 0,
            z: playerData.velocity?.z ?? 0
        }
        this.rotation = {
            pitch: playerData.pitch ?? 0,
            yaw: playerData.yaw ?? 0,
            headYaw: playerData.head_yaw ?? 0
        }
        this.gamemode = playerData.gamemode ?? null
        this.metadata = playerData.metadata ?? {}
        this.properties = playerData.properties ?? {}
        this.abilities = playerData.abilities ?? []
        this.links = playerData.links ?? {}
        this.deviceOs = playerData.device_os ?? null
        this.isConfirmed = playerData.isConfirmed ?? false
        this.lastMovementTime = Date.now()
        this.detectionMethod = playerData.detectionMethod || 'unknown'
    }

    updateFromMovement(position, rotation) {
        if (position) {
            this.position.x = position.x ?? this.position.x
            this.position.y = position.y ?? this.position.y
            this.position.z = position.z ?? this.position.z
        }
        if (rotation) {
            this.rotation.pitch = rotation.pitch ?? this.rotation.pitch
            this.rotation.yaw = rotation.yaw ?? this.rotation.yaw
            this.rotation.headYaw = rotation.head_yaw ?? this.rotation.headYaw
        }
        this.lastMovementTime = Date.now()
    }

    updateFromAddPlayer(playerData) {
        if (playerData.position) {
            this.position.x = playerData.position.x
            this.position.y = playerData.position.y
            this.position.z = playerData.position.z
        }
        if (playerData.velocity) {
            this.velocity.x = playerData.velocity.x
            this.velocity.y = playerData.velocity.y
            this.velocity.z = playerData.velocity.z
        }
        if (playerData.rotation) {
            this.rotation.pitch = playerData.rotation.pitch ?? this.rotation.pitch
            this.rotation.yaw = playerData.rotation.yaw ?? this.rotation.yaw
            this.rotation.headYaw = playerData.rotation.head_yaw ?? this.rotation.headYaw
        }
        if (playerData.gamemode !== undefined) {
            this.gamemode = playerData.gamemode
        }
        if (playerData.metadata) {
            this.metadata = playerData.metadata
        }
        if (playerData.username) {
            this.username = playerData.username
        }
        if (playerData.uuid) {
            this.uuid = playerData.uuid
        }
        this.isConfirmed = true
        this.lastMovementTime = Date.now()
    }

    confirm(playerData) {
        if (playerData.uuid) this.uuid = playerData.uuid
        if (playerData.username) this.username = playerData.username
        if (playerData.unique_id) this.uniqueId = BigInt(playerData.unique_id)
        this.isConfirmed = true
        this.lastMovementTime = Date.now()
    }

    toString() {
        return `Player(runtimeId=${this.runtimeId}, uniqueId=${this.uniqueId}, username=${this.username}, uuid=${this.uuid}, posX=${this.position.x.toFixed(2)}, posY=${this.position.y.toFixed(2)}, posZ=${this.position.z.toFixed(2)}, confirmed=${this.isConfirmed})`
    }

    getInfo() {
        return {
            uuid: this.uuid,
            username: this.username,
            runtimeId: this.runtimeId.toString(),
            uniqueId: this.uniqueId.toString(),
            position: this.position,
            rotation: this.rotation,
            gamemode: this.gamemode,
            deviceOs: this.deviceOs,
            isConfirmed: this.isConfirmed,
            detectionMethod: this.detectionMethod,
            lastMovementTime: this.lastMovementTime
        }
    }
}

class EntityPlayer {
    constructor(player) {
        this.player = player
        this.players = new Map()
        this.playersByUuid = new Map()
        this.playersByUniqueId = new Map()
        this.pendingPlayers = new Map()
        this.cleanupInterval = null
        this.setupPacketListeners()
        this.startCleanup()
    }

    setupPacketListeners() {
        this.player.on('clientbound', ({ name, params }, des) => {
            switch(name) {
                case 'add_player':
                    this.handleAddPlayer(params)
                    break
                case 'move_player':
                    this.handleMovePlayer(params)
                    break
                case 'move_entity':
                    this.handleMoveEntity(params)
                    break
                case 'remove_actor':
                    this.handleRemoveActor(params)
                    break
                case 'set_actor_data':
                    this.handleSetActorData(params)
                    break
            }
        })
    }

    handleAddPlayer(params) {
        const runtimeId = BigInt(params.runtime_id ?? 0n).toString()
        const uuid = params.uuid || ''
        const uniqueId = BigInt(params.unique_id ?? 0n).toString()

        let player = this.players.get(runtimeId) ||
            this.playersByUuid.get(uuid) ||
            this.playersByUniqueId.get(uniqueId) ||
            this.pendingPlayers.get(runtimeId)

        if (player) {
            player.updateFromAddPlayer(params)
            player.detectionMethod = 'add_player'

            if (this.pendingPlayers.has(runtimeId)) {
                this.pendingPlayers.delete(runtimeId)
                this.players.set(runtimeId, player)
                if (uuid) this.playersByUuid.set(uuid, player)
                if (uniqueId !== '0') this.playersByUniqueId.set(uniqueId, player)
            }
        } else {
            params.detectionMethod = 'add_player'
            params.isConfirmed = true
            player = new Player(params)
            this.addPlayerToMaps(player)
        }

        return player
    }

    handleMovePlayer(params) {
        const runtimeId = BigInt(params.runtime_id ?? 0n).toString()
        let player = this.players.get(runtimeId) || this.pendingPlayers.get(runtimeId)

        if (!player) {
            player = new Player({
                runtime_id: params.runtime_id,
                detectionMethod: 'move_player',
                isConfirmed: false,
                position: {
                    x: params.position?.x ?? 0,
                    y: params.position?.y ?? 0,
                    z: params.position?.z ?? 0
                },
                rotation: {
                    pitch: params.pitch ?? 0,
                    yaw: params.yaw ?? 0,
                    headYaw: params.head_yaw ?? 0
                }
            })
            this.pendingPlayers.set(runtimeId, player)
        }

        player.updateFromMovement(
            {
                x: params.position?.x ?? player.position.x,
                y: params.position?.y ?? player.position.y,
                z: params.position?.z ?? player.position.z
            },
            {
                pitch: params.pitch ?? player.rotation.pitch,
                yaw: params.yaw ?? player.rotation.yaw,
                head_yaw: params.head_yaw ?? player.rotation.headYaw
            }
        )

        return player
    }

    handleMoveEntity(params) {
        const runtimeId = BigInt(params.runtime_entity_id ?? 0n).toString()
        let player = this.players.get(runtimeId) || this.pendingPlayers.get(runtimeId)

        if (!player) {
            player = new Player({
                runtime_id: params.runtime_entity_id,
                detectionMethod: 'move_entity',
                isConfirmed: false,
                position: {
                    x: params.position?.x ?? 0,
                    y: params.position?.y ?? 0,
                    z: params.position?.z ?? 0
                },
                rotation: {
                    pitch: params.rotation?.pitch ?? 0,
                    yaw: params.rotation?.yaw ?? 0,
                    headYaw: params.rotation?.head_yaw ?? 0
                }
            })
            this.pendingPlayers.set(runtimeId, player)
        } else {
            player.updateFromMovement(
                {
                    x: params.position?.x ?? player.position.x,
                    y: params.position?.y ?? player.position.y,
                    z: params.position?.z ?? player.position.z
                },
                params.rotation ? {
                    pitch: params.rotation.pitch ?? player.rotation.pitch,
                    yaw: params.rotation.yaw ?? player.rotation.yaw,
                    head_yaw: params.rotation.head_yaw ?? player.rotation.headYaw
                } : null
            )
        }

        return player
    }

    handleSetActorData(params) {
        const runtimeId = BigInt(params.runtime_entity_id ?? 0n).toString()
        const player = this.players.get(runtimeId) || this.pendingPlayers.get(runtimeId)

        if (player && params.metadata) {
            player.metadata = params.metadata
            player.lastMovementTime = Date.now()

            if (this.pendingPlayers.has(runtimeId)) {
                this.confirmPlayer(runtimeId)
            }
        }
    }

    handleRemoveActor(params) {
        const runtimeId = BigInt(params.entity_id ?? params.runtime_entity_id ?? 0n).toString()
        const player = this.players.get(runtimeId) || this.pendingPlayers.get(runtimeId)

        if (player) {
            this.players.delete(runtimeId)
            this.pendingPlayers.delete(runtimeId)
            if (player.uuid) this.playersByUuid.delete(player.uuid)
            const uniqueId = player.uniqueId?.toString()
            if (uniqueId && uniqueId !== '0') this.playersByUniqueId.delete(uniqueId)
        }
    }

    addPlayerToMaps(player) {
        const runtimeId = player.runtimeId.toString()
        this.players.set(runtimeId, player)

        if (player.uuid) {
            this.playersByUuid.set(player.uuid, player)
        }

        const uniqueId = player.uniqueId.toString()
        if (uniqueId !== '0') {
            this.playersByUniqueId.set(uniqueId, player)
        }

        this.pendingPlayers.delete(runtimeId)
    }

    confirmPlayer(runtimeId) {
        const player = this.pendingPlayers.get(runtimeId)
        if (player) {
            player.isConfirmed = true
            this.addPlayerToMaps(player)
        }
    }

    startCleanup() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now()
            const timeout = 300

            for (const [runtimeId, player] of this.pendingPlayers.entries()) {
                if (now - player.lastMovementTime > timeout) {
                    this.pendingPlayers.delete(runtimeId)
                }
            }
        }, 300)
    }

    getAllPlayers(includeUnconfirmed = false) {
        const confirmed = Array.from(this.players.values())
        if (includeUnconfirmed) {
            return confirmed.concat(Array.from(this.pendingPlayers.values()))
        }
        return confirmed
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
        }
        this.players.clear()
        this.playersByUuid.clear()
        this.playersByUniqueId.clear()
        this.pendingPlayers.clear()
    }
}

module.exports = EntityPlayer