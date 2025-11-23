import React, { useState } from 'react'
import Editor from './components/Editor'
import Scene from './components/Scene'
import FabricationPanel from './components/FabricationPanel'
import AssemblyPanel from './components/AssemblyPanel'
import ExportPanel from './components/ExportPanel'
import { useWeaponStore } from './store'
import { translations } from './i18n/translations'

type Tab = 'fabrication' | 'assembly' | 'export'

function App() {
    const [activeTab, setActiveTab] = useState<Tab>('fabrication')
    const { language, setLanguage } = useWeaponStore()
    const t = translations[language]

    return (
        <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden">
            {/* Left Panel: Editor */}
            <div className="w-1/3 border-r border-gray-700 flex flex-col">
                <div className="p-2 bg-gray-800 font-bold text-sm border-b border-gray-700 flex justify-between items-center">
                    <span>{t.protocolEditor.toUpperCase()}</span>
                    {/* Language Switcher */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setLanguage('zh-TW')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${language === 'zh-TW' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                }`}
                        >
                            中文
                        </button>
                        <button
                            onClick={() => setLanguage('en-US')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${language === 'en-US' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                }`}
                        >
                            EN
                        </button>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <Editor />
                </div>
            </div>

            {/* Center Panel: 3D Scene */}
            <div className="flex-1 relative bg-black">
                <Scene />
                <div className="absolute top-4 left-4 pointer-events-none">
                    <div className="text-xs font-bold text-gray-500 tracking-widest">PROTOCOL: FOUNDRY</div>
                    <div className="text-[10px] text-gray-600 mt-1">V.1.0.0 // {t.scenePreview.toUpperCase()}</div>
                </div>
            </div>

            {/* Right Panel: Inspector & Controls */}
            <div className="w-80 border-l border-gray-700 flex flex-col bg-gray-900">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-700 bg-gray-800">
                    <button
                        onClick={() => setActiveTab('fabrication')}
                        className={`flex-1 py-3 text-[10px] font-bold tracking-wider transition-colors ${activeTab === 'fabrication'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {t.tabFabrication.toUpperCase()}
                    </button>
                    <button
                        onClick={() => setActiveTab('assembly')}
                        className={`flex-1 py-3 text-[10px] font-bold tracking-wider transition-colors ${activeTab === 'assembly'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {t.tabAssembly.toUpperCase()}
                    </button>
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 py-3 text-[10px] font-bold tracking-wider transition-colors ${activeTab === 'export'
                            ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {t.tabExport.toUpperCase()}
                    </button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden bg-gray-900">
                    {activeTab === 'fabrication' && <FabricationPanel />}
                    {activeTab === 'assembly' && <AssemblyPanel />}
                    {activeTab === 'export' && <ExportPanel />}
                </div>

                {/* Status Footer */}
                <div className="h-8 border-t border-gray-700 bg-gray-800 flex items-center justify-between px-4 text-[10px] text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span>SYSTEM ONLINE</span>
                    </div>
                    <span>UNKNOWN USER</span>
                </div>
            </div>
        </div>
    )
}

export default App
