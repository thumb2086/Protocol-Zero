export type Language = 'zh-TW' | 'en-US'

export interface Translations {
    // App Title
    appTitle: string

    // Panels
    protocolEditor: string
    scenePreview: string
    inspector: string

    // Tabs
    tabFabrication: string
    tabAssembly: string
    tabExport: string

    // Fabrication Panel
    partFabrication: string
    selectPartType: string
    partTypes: {
        receiver: string
        barrel: string
        handguard: string
        magazine: string
        scope: string
        stock: string
        grip: string
    }
    materialParameters: string
    baseMaterial: string
    metalness: string
    roughness: string
    wearTear: string
    geometrySpecs: string
    globalScale: string
    barrelLength: string
    barrelDiameter: string
    gripErgonomics: string
    tacticalRailSystem: string
    fabricatePart: string

    // Assembly Panel
    weaponAssembly: string
    weaponType: string
    weaponTypes: {
        knife: string
        pistol: string
        rifle: string
    }
    installedModules: string
    explodedView: string

    // Export Panel
    protocolExport: string
    currentConfiguration: string
    parameters: string
    valid: string
    protocolPreview: string
    downloadProtocol: string
    export3DModel: string

    // Weapon Names
    weaponNames: {
        classic: string
        vandal: string
        phantom: string
    }

    // Footer
    systemOnline: string
    unknownUser: string

    // Common
    enabled: string
    disabled: string
}

export const translations: Record<Language, Translations> = {
    'zh-TW': {
        appTitle: 'Protocol: Foundry',
        protocolEditor: '協定編輯器',
        scenePreview: '預覽',
        inspector: '檢視器',

        tabFabrication: '製造',
        tabAssembly: '組裝',
        tabExport: '導出',

        partFabrication: '零件製造',
        selectPartType: '選擇零件類型',
        partTypes: {
            receiver: '機匣',
            barrel: '槍管',
            handguard: '護木',
            magazine: '彈匣',
            scope: '瞄具',
            stock: '槍托',
            grip: '握把'
        },
        materialParameters: '材質參數',
        baseMaterial: '基礎材質',
        metalness: '金屬度',
        roughness: '粗糙度',
        wearTear: '磨損程度',
        geometrySpecs: '幾何規格',
        globalScale: '整體縮放',
        barrelLength: '槍管長度',
        barrelDiameter: '槍管直徑',
        gripErgonomics: '握把人體工學',
        tacticalRailSystem: '戰術導軌系統',
        fabricatePart: '製造零件',

        weaponAssembly: '武器組裝',
        weaponType: '武器類型',
        weaponTypes: {
            knife: '刀具',
            pistol: '手槍',
            rifle: '步槍'
        },
        installedModules: '已安裝模組',
        explodedView: '分解視圖',

        protocolExport: '協定導出',
        currentConfiguration: '當前配置',
        parameters: '參數',
        valid: '有效',
        protocolPreview: '預覽',
        downloadProtocol: '下載協定 (.JSON)',
        export3DModel: '導出 3D 模型 (.GLB)',

        weaponNames: {
            classic: '制式手槍',
            vandal: '暴徒',
            phantom: '幻象'
        },

        systemOnline: '系統在線',
        unknownUser: '未知用戶',

        enabled: '已安裝',
        disabled: '停用'
    },
    'en-US': {
        appTitle: 'Protocol: Foundry',
        protocolEditor: 'Protocol Editor',
        scenePreview: 'Preview',
        inspector: 'Inspector',

        tabFabrication: 'FABRICATION',
        tabAssembly: 'ASSEMBLY',
        tabExport: 'EXPORT',

        partFabrication: 'Part Fabrication',
        selectPartType: 'Select Part Type',
        partTypes: {
            receiver: 'Receiver',
            barrel: 'Barrel',
            handguard: 'Handguard',
            magazine: 'Magazine',
            scope: 'Scope',
            stock: 'Stock',
            grip: 'Grip'
        },
        materialParameters: 'Material Parameters',
        baseMaterial: 'Base Material',
        metalness: 'Metalness',
        roughness: 'Roughness',
        wearTear: 'Wear & Tear',
        geometrySpecs: 'Geometry Specs',
        globalScale: 'Global Scale',
        barrelLength: 'Barrel Length',
        barrelDiameter: 'Barrel Diameter',
        gripErgonomics: 'Grip Ergonomics',
        tacticalRailSystem: 'Tactical Rail System',
        fabricatePart: 'FABRICATE PART',

        weaponAssembly: 'Weapon Assembly',
        weaponType: 'Weapon Type',
        weaponTypes: {
            knife: 'Knife',
            pistol: 'Pistol',
            rifle: 'Rifle'
        },
        installedModules: 'Installed Modules',
        explodedView: 'Exploded View',

        protocolExport: 'Protocol Export',
        currentConfiguration: 'Current Configuration',
        parameters: 'Params',
        valid: 'Valid',
        protocolPreview: 'Preview',
        downloadProtocol: 'Download Protocol (.JSON)',
        export3DModel: 'Export 3D Model (.GLB)',

        weaponNames: {
            classic: 'Classic',
            vandal: 'Vandal',
            phantom: 'Phantom'
        },

        systemOnline: 'SYSTEM ONLINE',
        unknownUser: 'UNKNOWN USER',

        enabled: 'Installed',
        disabled: 'Disabled'
    }
}
