const toggle = require("./../toggle")
const settings = require("./../settings");

class Killaura {
    constructor(player, localPlayer, playerManager) {
        this.player = player
        this.localPlayer = localPlayer
        this.playerManager = playerManager
        this.lastAttackTime = 0
        this.currentParams = null

        //module settings
        this.cps = settings.killaura_cps
        this.range = settings.killaura_range

        if (!this.playerManager) {
            return
        }

        player.on('serverbound', ({ name, params }) => {
            if (name !== 'player_auth_input') return
            if (!toggle.killaura) return
            const t = this.findClosestPlayer()
            if (t) console.log("nearest:", t.username, "dist:", this.getDistance(this.localPlayer.position, t.position))
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
        if (!this.playerManager) return null;
        const selfId = this.localPlayer.runtimeEntityId.toString();

        let closest = null, min = Infinity;
        for (const p of this.playerManager.getAllPlayers()) {
            if (p.runtimeId.toString() === selfId) continue;
            if (!p.isConfirmed) continue;
            if (this.playerManager.isPlayerRemoved(p.runtimeId)) continue;

            const d = this.getDistance(this.localPlayer.position, p.position);
            if (d < min) { min = d; closest = p; }
        }
        return closest;
    }

    canAttack() {
        const currentTime = Date.now() / 1000
        const attackInterval = 1.0 / this.cps

        return (currentTime - this.lastAttackTime) >= attackInterval
    }

    attack(target) {
        const held = {
            network_id: 0, count: 0, metadata: 0,
            has_stack_id: false, block_runtime_id: 0,
            extra: { has_nbt: false, can_place_on: [], can_destroy: [] }
        };

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
                    held_item: this.currentParams?.held_item ?? held,
                    player_pos: this.localPlayer.position,
                    click_pos: {x: 0, y: 0, z: 0}
                }
            }
        })

        if (toggle.damagetext) {
            this.player.queue('text', {
                type: 'system',
                needs_translation: false,
                source_name: '',
                xuid: '',
                platform_chat_id: '',
                filtered_message: '',
                message: `§f${target.username}§r §cEnemy Damaged`
            })
        }
    }

    update() {
        if (!this.localPlayer.position) return;

        const target = this.findClosestPlayer();
        if (!target) return;

        const distance = this.getDistance(this.localPlayer.position, target.position);
        if (distance > this.range) return;
        if (!this.canAttack()) return;

        this.attack(target);
        this.lastAttackTime = Date.now() / 1000;
    }
}

module.exports = Killaura