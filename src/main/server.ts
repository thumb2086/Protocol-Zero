import dgram from 'dgram'

/**
 * Protocol: Zero - UDP Game Server
 * Handles multiplayer networking for local games
 */

interface PlayerState {
    id: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number }
    health: number
    lastUpdate: number
}

enum PacketType {
    CONNECT = 0x01,
    DISCONNECT = 0x02,
    MOVE = 0x03,
    SHOOT = 0x04,
    HIT = 0x05,
    DEATH = 0x06,
    PING = 0x07
}

export class GameServer {
    private socket: dgram.Socket
    private players: Map<string, PlayerState> = new Map()
    private port: number = 41234

    constructor(port: number = 41234) {
        this.port = port
        this.socket = dgram.createSocket('udp4')
    }

    start(): void {
        this.socket.on('error', (err) => {
            console.error('[Server] Error:', err)
            this.socket.close()
        })

        this.socket.on('message', (msg, rinfo) => {
            try {
                const packet = this.parsePacket(msg)
                this.handlePacket(packet, rinfo)
            } catch (err) {
                console.error('[Server] Failed to parse packet:', err)
            }
        })

        this.socket.on('listening', () => {
            const address = this.socket.address()
            console.log(`✓ Game Server listening on ${address.address}:${address.port}`)
            console.log('  Ready for UDP connections')
        })

        this.socket.bind(this.port)
    }

    private parsePacket(buffer: Buffer): any {
        // Simple packet structure: [type:1byte][data:json]
        const type = buffer.readUInt8(0)
        const data = JSON.parse(buffer.slice(1).toString('utf-8'))
        return { type, data }
    }

    private handlePacket(packet: any, rinfo: dgram.RemoteInfo): void {
        const clientId = `${rinfo.address}:${rinfo.port}`

        switch (packet.type) {
            case PacketType.CONNECT:
                console.log(`[Server] Player connected: ${clientId}`)
                this.players.set(clientId, {
                    id: clientId,
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0 },
                    health: 100,
                    lastUpdate: Date.now()
                })
                this.broadcast({ type: 'PLAYER_JOINED', playerId: clientId })
                break

            case PacketType.DISCONNECT:
                console.log(`[Server] Player disconnected: ${clientId}`)
                this.players.delete(clientId)
                this.broadcast({ type: 'PLAYER_LEFT', playerId: clientId })
                break

            case PacketType.MOVE:
                const player = this.players.get(clientId)
                if (player) {
                    player.position = packet.data.position
                    player.rotation = packet.data.rotation
                    player.lastUpdate = Date.now()

                    // Broadcast position to all other clients
                    this.broadcast({
                        type: 'PLAYER_MOVED',
                        playerId: clientId,
                        position: player.position,
                        rotation: player.rotation
                    }, clientId)
                }
                break

            case PacketType.SHOOT:
                console.log(`[Server] Player ${clientId} fired weapon`)
                this.broadcast({
                    type: 'PLAYER_SHOT',
                    playerId: clientId,
                    weaponId: packet.data.weaponId,
                    timestamp: Date.now()
                }, clientId)
                break

            case PacketType.PING:
                // Echo back for latency measurement
                this.send({ type: 'PONG', timestamp: packet.data.timestamp }, rinfo)
                break

            default:
                console.warn(`[Server] Unknown packet type: ${packet.type}`)
        }
    }

    private broadcast(data: any, excludeClientId?: string): void {
        const message = Buffer.from(JSON.stringify(data))

        this.players.forEach((player, clientId) => {
            if (clientId !== excludeClientId) {
                const [address, port] = clientId.split(':')
                this.socket.send(message, parseInt(port), address)
            }
        })
    }

    private send(data: any, rinfo: dgram.RemoteInfo): void {
        const message = Buffer.from(JSON.stringify(data))
        this.socket.send(message, rinfo.port, rinfo.address)
    }

    stop(): void {
        console.log('[Server] Shutting down...')
        this.socket.close()
        this.players.clear()
    }

    getPlayerCount(): number {
        return this.players.size
    }
}
