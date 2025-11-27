import React from 'react'
import { useWeaponStore, PartType } from '../store'
import { translations } from '../i18n/translations'

const FabricationPanel: React.FC = () => {
    const { params, updateParams, language, selectedPart, setSelectedPart } = useWeaponStore()
    const t = translations[language]

    const partOptions: PartType[] = ['receiver', 'barrel', 'handguard', 'magazine', 'scope', 'stock', 'grip']

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {t.partFabrication}
            </div>

            {/* Part Type Selector */}
            <div className="space-y-2">
                <label className="block text-xs text-gray-400">{t.selectPartType}</label>
                <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value as PartType)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                    {partOptions.map(part => (
                        <option key={part} value={part}>
                            {t.partTypes[part]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Material Settings */}
            <div className="space-y-4">
                <div className="text-xs text-blue-400 font-bold border-b border-blue-900/30 pb-1">
                    {t.materialParameters.toUpperCase()}
                </div>

                {/* Color Picker */}
                <div>
                    <label className="block text-xs text-gray-400 mb-2">{t.baseMaterial}</label>
                    <div className="flex gap-2 flex-wrap">
                        {['#4a5568', '#e53e3e', '#3182ce', '#38a169', '#d69e2e', '#805ad5', '#1a202c', '#cbd5e0'].map((color) => (
                            <button
                                key={color}
                                onClick={() => updateParams({ color })}
                                className={`w-6 h-6 rounded-sm border transition-all ${params.color === color ? 'border-white scale-110 shadow-lg shadow-blue-500/50' : 'border-transparent hover:border-gray-400'
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Metalness Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.metalness}</span>
                        <span className="text-gray-500 font-mono">{(params.metalness * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={params.metalness}
                        onChange={(e) => updateParams({ metalness: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Roughness Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.roughness}</span>
                        <span className="text-gray-500 font-mono">{(params.roughness * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={params.roughness}
                        onChange={(e) => updateParams({ roughness: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Wear Level Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.wearTear}</span>
                        <span className="text-gray-500 font-mono">{(params.wearLevel * 100).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={params.wearLevel}
                        onChange={(e) => updateParams({ wearLevel: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                </div>
            </div>

            {/* Geometric Settings */}
            <div className="space-y-4">
                <div className="text-xs text-blue-400 font-bold border-b border-blue-900/30 pb-1">
                    {t.geometrySpecs.toUpperCase()}
                </div>

                {/* Scale Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.globalScale}</span>
                        <span className="text-gray-500 font-mono">{params.scale.toFixed(2)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={params.scale}
                        onChange={(e) => updateParams({ scale: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Barrel Length Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.barrelLength}</span>
                        <span className="text-gray-500 font-mono">{params.barrelLength.toFixed(2)}u</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={params.barrelLength}
                        onChange={(e) => updateParams({ barrelLength: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Barrel Diameter Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.barrelDiameter}</span>
                        <span className="text-gray-500 font-mono">{params.barrelDiameter.toFixed(2)}u</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={params.barrelDiameter}
                        onChange={(e) => updateParams({ barrelDiameter: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Grip Size Slider */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{t.gripErgonomics}</span>
                        <span className="text-gray-500 font-mono">{params.gripSize.toFixed(2)}u</span>
                    </div>
                    <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.05"
                        value={params.gripSize}
                        onChange={(e) => updateParams({ gripSize: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Rail System Toggle */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{t.tacticalRailSystem}</span>
                    <button
                        onClick={() => updateParams({ railSystem: !params.railSystem })}
                        className={`w-10 h-5 rounded-full transition-colors relative ${params.railSystem ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${params.railSystem ? 'left-5' : 'left-0.5'
                            }`} />
                    </button>
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={() => {
                        console.log(`製造零件: ${t.partTypes[selectedPart]}`, params)

                        // Send IPC message to equip the part in the game
                        if (window.electron?.ipcRenderer) {
                            window.electron.ipcRenderer.send('equip-part', {
                                slot: selectedPart,
                                partData: {
                                    ...params,
                                    partType: selectedPart
                                }
                            })

                            // Show brief feedback
                            const notification = document.createElement('div')
                            notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50'
                            notification.textContent = `✓ ${t.partTypes[selectedPart]} 已裝備`
                            document.body.appendChild(notification)

                            setTimeout(() => {
                                notification.remove()
                            }, 2000)
                        } else {
                            alert(`⚠️ Electron IPC 不可用\n\n請在 Electron 環境中運行此功能。`)
                        }
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wider rounded transition-colors"
                >
                    {t.fabricatePart.toUpperCase()}
                </button>
            </div>
        </div>
    )
}

export default FabricationPanel
