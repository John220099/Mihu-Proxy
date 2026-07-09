const { Relay } = require('bedrock-protocol')
const LocalPlayer = require('./entity/localplayer')
const Commands = require("./commands/toggle");
const Modules = require('./commands/modules');
const AirJump = require('./modules/movement/airjump')
const Glide = require('./modules/movement/glide')
const FullBright = require('./modules/render/fullbright')
const FastBreak = require('./modules/misc/fastbreak')
const Speed = require("./modules/movement/speed")
const Fly = require("./modules/movement/fly")
const Spider = require("./modules/movement/spider")

const hostip = '0.0.0.0'
const hostport = 19132

const port = 19132
const ip = 'play.lbsg.net'

const relay = new Relay({
    version: '1.21.93',
    host: hostip,
    port: hostport,
    maxPlayers: 1,
    motd: {
        motd: 'mihu proxy',
        levelName: ip,
    },
    destination: {
        host: ip,
        port: port
    },
    timeout: 5000
})

relay.listen()

relay.on('connect', player => {

    //data
    const localPlayer = new LocalPlayer(player)

    //commands
    const commands = new Commands(player)
    const modules = new Modules(player)

    //modules
    const airJump = new AirJump(player, localPlayer)
    const glide = new Glide(player, localPlayer)
    const fullbright = new FullBright(player, localPlayer)
    const fastbreak = new FastBreak(player, localPlayer)
    const speed = new Speed(player, localPlayer)
    const fly = new Fly(player, localPlayer)
    const spider = new Spider(player, localPlayer)

    player.on('serverbound', ({name, params}, des) => {
        if (name === 'player_auth_input') {
            player.queue('text', {
                type: 'tip',
                 needs_translation: false,
                source_name: '',
                xuid: '',
                platform_chat_id: '',
                filtered_message: '',
                message: '§l§k..§r§l§5MIHU PROXY§r§l§k..'
            })
        }
    })
})
