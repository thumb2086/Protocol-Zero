import React from 'react'
import { useWeaponStore, WeaponType } from '../store'
import { translations } from '../i18n/translations'

const AssemblyPanel: React.FC = () => {
    const { weaponType, setWeaponType, explodedViewDistance, setExplodedViewDistance, language } = useWeaponStore()
    const t = translations[language]

    const weaponTypes: { type: WeaponType; label: string }[] = [
        { type: 'classic', label: t.weaponNames?.classic || '制式手槍' },
        { type: 'vandal', label: t.weaponNames?.vandal || '暴徒' },
        { type: 'phantom', label: t.weaponNames?.phantom || '幻象' }
    ]

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {t.weaponAssembly}
            </div>

            {/* Weapon Type Selection */}
            <div className="space-y-2">
                <label className="block text-xs text-blue-400 font-bold border-b border-blue-900/30 pb-1">
                    {t.weaponType}
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {weaponTypes.map(({ type, label }) => (
                        <button
                            key={type}
                            onClick={() => setWeaponType(type)}
                            className={`px-2 py-2 text-[10px] font-mono transition-all border ${weaponType === type
                                ? 'bg-blue-600/20 text-blue-300 border-blue-500'
                                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                                } rounded`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assembly Slots (Placeholder for now) */}
            <div className="space-y-2">
                <label className="block text-xs text-blue-400 font-bold border-b border-blue-900/30 pb-1">
                    {t.installedModules}
                </label>
                <div className="space-y-1">
                    {[
                        { key: 'receiver', label: t.partTypes.receiver },
                        { key: 'barrel', label: t.partTypes.barrel },
                        { key: 'magazine', label: t.partTypes.magazine },
                        { key: 'scope', label: t.partTypes.scope },
                        { key: 'stock', label: t.partTypes.stock }
                    ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-gray-800/50 border border-gray-700 rounded">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-300">{label}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">{t.enabled}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Exploded View Control */}
            <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-blue-400 font-bold">{t.explodedView}</span>
                    <span className="text-blue-400 font-mono">{(explodedViewDistance * 100).toFixed(0)}%</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={explodedViewDistance}
                    onChange={(e) => setExplodedViewDistance(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
            </div>
        </div>
    )
}

export default AssemblyPanel
