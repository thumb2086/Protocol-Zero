import React, { useState, useEffect } from 'react'
import { useWeaponStore } from '../store'
import { translations } from '../i18n/translations'
import { partManager } from '../core/PartManager'
import { githubSync } from '../services/GitHubSyncService'
import { ModelExporter } from '../services/ModelExporter'
import GitHubAuthDialog from './GitHubAuthDialog'

const ExportPanel: React.FC = () => {
    const { weaponType, params, language, currentWeapon } = useWeaponStore()
    const t = translations[language]

    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [username, setUsername] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<string | null>(null)

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = () => {
        setIsAuthenticated(githubSync.isUserAuthenticated())
        setUsername(githubSync.getUsername())
    }

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

    const handleExportGLB = async () => {
        if (!currentWeapon) {
            alert(language === 'zh-TW' ? '請先在場景中生成武器' : 'Please generate a weapon in the scene first')
            return
        }

        try {
            const filename = `${weaponType}_${Date.now()}`
            const blob = await ModelExporter.exportToGLB(currentWeapon, filename)
            ModelExporter.downloadBlob(blob, `${filename}.glb`)

            alert(language === 'zh-TW' ? 'GLB 模型導出成功！' : 'GLB model exported successfully!')
        } catch (error) {
            console.error('GLB export failed:', error)
            alert(language === 'zh-TW' ? 'GLB 導出失敗' : 'GLB export failed')
        }
    }

    const handleSyncToGitHub = async () => {
        if (!isAuthenticated) {
            setIsAuthDialogOpen(true)
            return
        }

        if (!currentWeapon) {
            alert(language === 'zh-TW' ? '請先在場景中生成武器' : 'Please generate a weapon in the scene first')
            return
        }

        setIsUploading(true)
        setUploadStatus(language === 'zh-TW' ? '正在導出模型...' : 'Exporting model...')

        try {
            // 1. Export GLB model
            const filename = `${weaponType}_${Date.now()}`
            const modelBlob = await ModelExporter.exportToGLB(currentWeapon, filename)

            setUploadStatus(language === 'zh-TW' ? '正在上傳到 GitHub...' : 'Uploading to GitHub...')

            // 2. Get blueprint as WeaponBuild
            const blueprint = await partManager.loadBlueprint(weaponType) as any
            const weaponBuild = {
                name: `${t.weaponNames[weaponType as keyof typeof t.weaponNames]} Custom`,
                ...blueprint
            }

            // 3. Upload to GitHub
            const result = await githubSync.uploadBuild(weaponBuild, modelBlob)

            if (result.success) {
                setUploadStatus(language === 'zh-TW' ? '✅ 上傳成功！' : '✅ Upload successful!')
                setTimeout(() => setUploadStatus(null), 3000)

                if (result.prUrl) {
                    alert(
                        (language === 'zh-TW' ? '武器已上傳到 GitHub！\n倉庫：' : 'Weapon uploaded to GitHub!\nRepository: ') +
                        result.prUrl
                    )
                }
            } else {
                throw new Error(result.error || 'Upload failed')
            }
        } catch (error) {
            console.error('GitHub sync failed:', error)
            setUploadStatus(language === 'zh-TW' ? '❌ 上傳失敗' : '❌ Upload failed')
            setTimeout(() => setUploadStatus(null), 3000)
            alert(`${language === 'zh-TW' ? '上傳失敗：' : 'Upload failed: '}${(error as Error).message}`)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSignOut = async () => {
        await githubSync.signOut()
        checkAuthStatus()
        alert(language === 'zh-TW' ? '已登出 GitHub' : 'Signed out from GitHub')
    }

    return (
        <div className="p-4 space-y-6 h-full overflow-y-auto flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                {t.protocolExport}
            </div>

            {/* GitHub Auth Status */}
            <div className={`p-3 border rounded ${isAuthenticated ? 'bg-green-900/20 border-green-700' : 'bg-gray-800/50 border-gray-700'}`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-gray-400">
                        {language === 'zh-TW' ? 'GITHUB 狀態' : 'GITHUB STATUS'}
                    </div>
                    {isAuthenticated && (
                        <button
                            onClick={handleSignOut}
                            className="text-[10px] text-red-400 hover:text-red-300"
                        >
                            {language === 'zh-TW' ? '登出' : 'Sign Out'}
                        </button>
                    )}
                </div>
                {isAuthenticated ? (
                    <div className="text-xs text-green-400">
                        ✅ {language === 'zh-TW' ? '已認證：' : 'Authenticated: '}
                        <span className="font-mono">{username}</span>
                    </div>
                ) : (
                    <div className="text-xs text-gray-500">
                        ⚠️ {language === 'zh-TW' ? '未認證' : 'Not authenticated'}
                    </div>
                )}
            </div>

            {/* Upload Status */}
            {uploadStatus && (
                <div className="p-3 bg-blue-900/20 border border-blue-700 rounded text-xs text-blue-300">
                    {uploadStatus}
                </div>
            )}

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
                {/* GitHub Sync Button */}
                <button
                    onClick={handleSyncToGitHub}
                    disabled={isUploading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 border border-purple-500 disabled:border-gray-600 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-all"
                >
                    <span>
                        {isUploading
                            ? (language === 'zh-TW' ? '⏳ 上傳中...' : '⏳ Uploading...')
                            : (isAuthenticated
                                ? (language === 'zh-TW' ? '🚀 同步到 GITHUB' : '🚀 SYNC TO GITHUB')
                                : (language === 'zh-TW' ? '🔐 登入並同步到 GITHUB' : '🔐 LOGIN & SYNC TO GITHUB')
                            )
                        }
                    </span>
                </button>

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

                <button
                    onClick={handleExportGLB}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-white text-xs font-bold tracking-wider rounded flex items-center justify-center gap-2 transition-colors">
                    <span>📦 {language === 'zh-TW' ? '導出 3D 模型 (.GLB)' : 'Export 3D Model (.GLB)'}</span>
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

            {/* GitHub Auth Dialog */}
            <GitHubAuthDialog
                isOpen={isAuthDialogOpen}
                onClose={() => setIsAuthDialogOpen(false)}
                onAuthenticated={checkAuthStatus}
            />
        </div>
    )
}

export default ExportPanel
