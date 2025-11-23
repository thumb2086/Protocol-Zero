import { create } from 'zustand'
import { Language } from './i18n/translations'

export type WeaponType = 'knife' | 'classic' | 'vandal' | 'phantom'
export type PartType = 'receiver' | 'barrel' | 'handguard' | 'magazine' | 'scope' | 'stock' | 'grip'

export interface WeaponParams {
    // Basic
    scale: number
    barrelLength: number
    gripSize: number
    color: string

    // Geometry
    barrelDiameter: number
    gripThickness: number
    railSystem: boolean

    // Material (PBR)
    metalness: number
    roughness: number
    wearLevel: number
}

export interface WeaponStore {
    weaponType: WeaponType
    params: WeaponParams
    explodedViewDistance: number
    language: Language
    selectedPart: PartType
    setWeaponType: (type: WeaponType) => void
    updateParams: (params: Partial<WeaponParams>) => void
    setExplodedViewDistance: (dist: number) => void
    setLanguage: (lang: Language) => void
    setSelectedPart: (part: PartType) => void
}

export const useWeaponStore = create<WeaponStore>((set) => ({
    weaponType: 'vandal',
    params: {
        scale: 1,
        barrelLength: 1,
        gripSize: 1,
        color: '#4a5568',
        barrelDiameter: 1.0,
        gripThickness: 1.0,
        railSystem: true,
        metalness: 0.8,
        roughness: 0.4,
        wearLevel: 0.1
    },
    explodedViewDistance: 0,
    language: 'zh-TW' as Language,
    selectedPart: 'receiver' as PartType,
    setWeaponType: (type) => set({ weaponType: type }),
    updateParams: (newParams) => set((state) => ({ params: { ...state.params, ...newParams } })),
    setExplodedViewDistance: (dist) => set({ explodedViewDistance: dist }),
    setLanguage: (lang) => set({ language: lang }),
    setSelectedPart: (part) => set({ selectedPart: part })
}))
