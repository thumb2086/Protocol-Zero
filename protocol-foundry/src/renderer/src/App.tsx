import React from 'react'
import Editor from './components/Editor'
import Scene from './components/Scene'
import { useWeaponStore, WeaponType } from './store'

function App(): JSX.Element {
    const { weaponType, setWeaponType } = useWeaponStore()

    const weaponButtons: { type: WeaponType; label: string }[] = [
        { type: 'knife', label: 'KNIFE' },
        { type: 'pistol', label: 'PISTOL' },
        { type: 'rifle', label: 'RIFLE' }
    ]

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden">
            {/* Left Panel: Editor */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
                <div className="p-2 bg-gray-800 font-bold text-sm border-b border-gray-700">
                    SCRIPT EDITOR
                </div>
                <div className="flex-1 relative">
                    <Editor />
                </div>
            </div>

            {/* Center Panel: 3D Scene */}
            <div className="flex-1 relative bg-black">
                <Scene />
                <div className="absolute top-4 left-4 text-xs text-gray-500 pointer-events-none">
                    PROTOCOL: FOUNDRY // PREVIEW
                </div>
            </div>

            {/* Right Panel: Inspector */}
            <div className="w-1/4 border-l border-gray-700 flex flex-col bg-gray-800">
                <div className="p-2 bg-gray-800 font-bold text-sm border-b border-gray-700">
                    INSPECTOR
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">STATUS</label>
                        <div className="text-green-400 text-sm">● SYSTEM ONLINE</div>
                    </div>

                    {/* Weapon Type Selector */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">WEAPON TYPE</label>
                        <div className="space-y-2">
                            {weaponButtons.map(({ type, label }) => (
                                <button
                                    key={type}
                                    onClick={() => setWeaponType(type)}
                                    className={`w-full px-4 py-2 text-sm font-mono transition-all ${weaponType === type
                                        ? 'bg-blue-600 text-white border-blue-400'
                                        : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                                        } border rounded`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Current Weapon Display */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">ACTIVE WEAPON</label>
                        <div className="text-blue-400 text-sm font-mono uppercase">
                            {weaponType}
                        </div>
                    </div>

                    {/* Placeholder */}
                    <div className="p-4 border border-dashed border-gray-600 rounded opacity-50 text-center text-xs">
                        CUSTOMIZATION CONTROLS COMING SOON
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
