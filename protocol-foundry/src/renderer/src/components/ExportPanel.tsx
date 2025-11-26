import React from 'react'
import { useWeaponStore } from '../store'
import { translations } from '../i18n/translations'
import { partManager } from '../core/PartManager'

const ExportPanel: React.FC = () => {
    const { weaponType, params, language } = useWeaponStore()
    const t = translations[language]

    const getProtocolJson = () => {
        return {
            protocol_version: "1.0",
            weapon_id: `custom_${weaponType}_${Date.now().toString().slice(-6)}`,
            metadata: {
                name: `${t.weaponNames[weaponType as keyof typeof t.weaponNames]} 客製化`,
                created_at: new Date().toISOString()
            },
            configuration: {
                type: weaponType,
                parameters: params
            }
        }
    }

    const handleExportProtocol = () => {
        const protocol = getProtocolJson()
        const blob = new Blob([JSON.stringify(protocol, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `protocol_${weaponType}_${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleExportBlueprint = async () => {
        const blueprint = await partManager.loadBlueprint(weaponType)
        if (blueprint) {
            const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `blueprint_${weaponType}_${Date.now()}.json`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {t.protocolExport}
            </div>

            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded space-y-2">
                <div className="text-xs text-gray-400">{t.currentConfiguration}</div>
                <div className="font-mono text-xs text-blue-300 break-all">
                    ID: custom_{weaponType}_{Date.now().toString().slice(-6)}
                </div>
                <div className="flex gap-2 text-[10px] text-gray-500">
                    <span>{t.parameters}: {Object.keys(params).length}</span>
                    <span>•</span>
                    <span>{t.valid}: TRUE</span>
                </div>
            </div>

            {/* Live Code Preview */}
            <div className="flex-1 min-h-[200px] bg-gray-950 border border-gray-800 rounded p-2 overflow-hidden flex flex-col">
                <div className="text-[10px] text-gray-500 font-mono mb-2 border-b border-gray-800 pb-1">{t.protocolPreview}: protocol.json</div>
                <pre className="flex-1 overflow-auto text-[10px] font-mono text-green-400/80 leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {JSON.stringify(getProtocolJson(), null, 2)}
                </pre>
            </div>

            <div className="space-y-2 mt-auto pt-4">
                <button
                    onClick={handleExportProtocol}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors"
                >
                    <span>{t.downloadProtocol}</span>
                </button>

                <button
                    onClick={handleExportBlueprint}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors">
                    <span>📘 {language === 'zh-TW' ? '導出藍圖 (.JSON)' : 'Export Blueprint (.JSON)'}</span>
                </button>

                <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors opacity-50 cursor-not-allowed">
                    <span>{t.export3DModel}</span>
                </button>

                <button
                    onClick={async () => {
                        const { runFactoryExamples } = await import('../examples/FactoryExamples');
                        await runFactoryExamples();
                        alert('Factory tests completed! Check console and warehouse folder.');
                    }}
                    className="w-full py-3 bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700 text-purple-200 text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors">
                    <span>🏭 {language === 'zh-TW' ? '運行工廠測試 (生成零件)' : 'Run Factory Tests'}</span>
                </button>
            </div>
        </div>
    )
}

export default ExportPanel
