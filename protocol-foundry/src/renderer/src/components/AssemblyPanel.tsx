import React from 'react'
import { useWeaponStore, WeaponType } from '../store'

const AssemblyPanel: React.FC = () => {
    const { weaponType, setWeaponType, explodedViewDistance, setExplodedViewDistance } = useWeaponStore()

    const weaponTypes: { type: WeaponType; label: string }[] = [
        { type: 'classic', label: 'CLASSIC' },
        { type: 'vandal', label: 'VANDAL' },
        { type: 'phantom', label: 'PHANTOM' }
    ]

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Assembly Station
            </div>

            {/* Weapon Type Selection */}
            <div className="space-y-2">
                <label className="block text-xs text-blue-400 font-bold border-b border-blue-900/30 pb-1">
                    FRAME TYPE
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
                    INSTALLED MODULES
                </label>
                <div className="space-y-1">
                    {['Receiver', 'Barrel', 'Magazine', 'Scope', 'Stock'].map((part) => (
                        <div key={part} className="flex items-center justify-between p-2 bg-gray-800/50 border border-gray-700 rounded">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-300">{part}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono">INSTALLED</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Exploded View Control */}
            <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-blue-400 font-bold">EXPLODED VIEW</span>
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
