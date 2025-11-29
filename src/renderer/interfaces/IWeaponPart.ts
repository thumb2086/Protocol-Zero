import { Mesh, Vector3 } from '@babylonjs/core'

export type PartType = 'receiver' | 'barrel' | 'stock' | 'magazine' | 'scope' | 'grip'

export interface IPartStats {
    damageMultiplier?: number
    fireRateMultiplier?: number
    recoilMultiplier?: number
    rangeMultiplier?: number
    weight?: number
}

export interface IWeaponPart {
    id: string
    type: PartType
    mesh: Mesh
    mountPoints: { [key: string]: Vector3 } // Local position of mount points
    stats?: IPartStats
}

export interface IWeaponBlueprint {
    id: string
    name: string
    baseType: string // 'rifle' | 'pistol' | 'sniper'
    components: {
        receiver: string
        barrel: string
        stock?: string
        magazine?: string
        scope?: string
        grip?: string
    }
    skin?: {
        primaryColor?: string
        emissiveColor?: string
    }
}
