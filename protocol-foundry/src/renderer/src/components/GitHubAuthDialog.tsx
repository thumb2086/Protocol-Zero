import React, { useState } from 'react'
import { githubSync } from '../services/GitHubSyncService'
import { translations } from '../i18n/translations'
import { useWeaponStore } from '../store'

interface GitHubAuthDialogProps {
    isOpen: boolean
    onClose: () => void
    onAuthenticated: () => void
}

const GitHubAuthDialog: React.FC<GitHubAuthDialogProps> = ({ isOpen, onClose, onAuthenticated }) => {
    const { language } = useWeaponStore()
    const t = translations[language]

    const [token, setToken] = useState('')
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuth = async () => {
        if (!token.trim()) {
            setError(language === 'zh-TW' ? '請輸入 Token' : 'Please enter token')
            return
        }

        setIsAuthenticating(true)
        setError(null)

        try {
            const success = await githubSync.authenticate(token)

            if (success) {
                setToken('')
                onAuthenticated()
                onClose()
            } else {
                setError(
                    language === 'zh-TW'
                        ? '認證失敗，請檢查 Token 是否正確'
                        : 'Authentication failed. Please check your token'
                )
            }
        } catch (err) {
            setError(
                language === 'zh-TW'
                    ? '認證時發生錯誤'
                    : 'Error during authentication'
            )
        } finally {
            setIsAuthenticating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
            <div
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-[500px] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-bold text-white tracking-wider">
                        🔐 {language === 'zh-TW' ? 'GITHUB 認證' : 'GITHUB AUTHENTICATION'}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white text-xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Instructions */}
                <div className="mb-4 p-3 bg-gray-900/50 border border-gray-700 rounded text-xs text-gray-400 space-y-2">
                    <p className="text-blue-400 font-bold">
                        {language === 'zh-TW' ? '📝 設置說明：' : '📝 Setup Instructions:'}
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[10px]">
                        <li>
                            {language === 'zh-TW'
                                ? '前往 '
                                : 'Go to '}
                            <a
                                href="https://github.com/settings/tokens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                github.com/settings/tokens
                            </a>
                        </li>
                        <li>{language === 'zh-TW' ? '點擊 "Generate new token (classic)"' : 'Click "Generate new token (classic)"'}</li>
                        <li>{language === 'zh-TW' ? '授予 "repo" 權限（完整倉庫訪問）' : 'Grant "repo" permission (full repository access)'}</li>
                        <li>{language === 'zh-TW' ? '複製生成的 Token 並粘貼到下方' : 'Copy the generated token and paste below'}</li>
                    </ol>
                </div>

                {/* Token Input */}
                <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-2">
                        {language === 'zh-TW' ? 'Personal Access Token:' : 'Personal Access Token:'}
                    </label>
                    <input
                        type="password"
                        value={token}
                        onChange={(e) => {
                            setToken(e.target.value)
                            setError(null)
                        }}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                        disabled={isAuthenticating}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-2 bg-red-900/20 border border-red-700 rounded text-xs text-red-400">
                        ⚠️ {error}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleAuth}
                        disabled={isAuthenticating || !token.trim()}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-bold rounded transition-colors"
                    >
                        {isAuthenticating
                            ? (language === 'zh-TW' ? '認證中...' : 'Authenticating...')
                            : (language === 'zh-TW' ? '認證' : 'Authenticate')
                        }
                    </button>
                    <button
                        onClick={onClose}
                        disabled={isAuthenticating}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded transition-colors"
                    >
                        {language === 'zh-TW' ? '取消' : 'Cancel'}
                    </button>
                </div>

                {/* Security Note */}
                <div className="mt-4 pt-3 border-t border-gray-700 text-[10px] text-gray-500">
                    🔒 {language === 'zh-TW'
                        ? 'Token 將使用 Electron 加密存儲，不會以明文保存。'
                        : 'Token is encrypted using Electron safeStorage, not saved in plain text.'}
                </div>
            </div>
        </div>
    )
}

export default GitHubAuthDialog
