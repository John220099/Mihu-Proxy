const toggle = require("./../toggle")

class Killaura {
    constructor(player, localPlayer, playerManager) {
        this.player = player
        this.localPlayer = localPlayer
        this.playerManager = playerManager
        this.lastAttackTime = 0
        this.currentParams = null

        //module settings
        this.cps = 16
        this.range = 9

        if (!this.playerManager) {
            return
        }

        player.on('serverbound', ({ name, params }) => {
            if (!toggle.killaura) return
            if (name !== 'player_auth_input') return

            this.currentParams = params
            this.update()
        })
    }

    getDistance(pos1, pos2) {
        const dx = pos2.x - pos1.x
        const dy = pos2.y - pos1.y
        const dz = pos2.z - pos1.z
        return Math.sqrt(dx * dx + dy * dy + dz * dz)
    }

    findClosestPlayer() {
        if (!this.playerManager) return null

        const allPlayers = this.playerManager.getAllPlayers()

        if (allPlayers.length === 0) return null

        let closest = null
        let minDistance = Infinity

        for (const targetPlayer of allPlayers) {
            const distance = this.getDistance(this.localPlayer.position, targetPlayer.position)
            if (distance < minDistance) {
                minDistance = distance
                closest = targetPlayer
            }
        }

        return closest
    }

    canAttack() {
        const currentTime = Date.now() / 1000
        const attackInterval = 1.0 / this.cps

        return (currentTime - this.lastAttackTime) >= attackInterval
    }

    attack(target) {

        const params = this.currentParams;

        this.player.upstream.queue('animate', {
            action_id: 1,
            runtime_entity_id: this.localPlayer.runtimeEntityId
        });

        this.player.queue('animate', {
            action_id: 1,
            runtime_entity_id: this.localPlayer.runtimeEntityId
        });

        this.player.upstream.queue('inventory_transaction', {
            transaction: {
                legacy: {
                    legacy_request_id: 0
                },
                transaction_type: 'item_use_on_entity',
                actions: [],
                transaction_data: {
                    entity_runtime_id: target.runtimeId,
                    action_type: 'attack',
                    hotbar_slot: this.localPlayer.Slot,
                    held_item: params.held_item ?? {
                        network_id: 0
                    },
                    player_pos: this.localPlayer.position,
                    click_pos: {x: 0, y: 0, z: 0}
                }
            }
        })
    }

    update() {
        const target = this.findClosestPlayer()

        if (!target) {
            return
        }

        if (!target.runtimeId) {
            return
        }

        if (!target.position) {
            return
        }

        if (!this.canAttack()) {
            return
        }

        const distance = this.getDistance(this.localPlayer.position, target.position)

        if (distance > this.range) {
            return
        }

        this.attack(target)
        this.lastAttackTime = Date.now() / 1000
    }
}

module.exports = Killaura