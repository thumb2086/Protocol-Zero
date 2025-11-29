import git from 'isomorphic-git'
import http from 'isomorphic-git/http/node'
import fs from 'fs'
import path from 'path'

export class RepoManager {
    /**
     * Syncs a remote repository to a local path (Clone if empty, Pull if exists)
     * @param repoUrl Remote repository URL
     * @param localPath Local directory path
     */
    public static async syncRepository(repoUrl: string, localPath: string): Promise<void> {
        try {
            console.log(`[RepoManager] Syncing ${repoUrl} to ${localPath}`)

            // Ensure directory exists
            if (!fs.existsSync(localPath)) {
                fs.mkdirSync(localPath, { recursive: true })
            }

            // Check if it's already a git repo
            const gitDir = path.join(localPath, '.git')
            const isRepo = fs.existsSync(gitDir)

            if (isRepo) {
                console.log('[RepoManager] Repository exists. Pulling...')
                await git.pull({
                    fs,
                    http,
                    dir: localPath,
                    singleBranch: true,
                    author: {
                        name: 'Protocol Zero Agent',
                        email: 'agent@protocol-zero.com'
                    }
                })
                console.log('[RepoManager] Pull complete.')
            } else {
                console.log('[RepoManager] Repository not found. Cloning...')
                await git.clone({
                    fs,
                    http,
                    dir: localPath,
                    url: repoUrl,
                    singleBranch: true,
                    depth: 1
                })
                console.log('[RepoManager] Clone complete.')
            }
        } catch (error) {
            console.error('[RepoManager] Error syncing repository:', error)
            // Don't throw, just log error so game can continue offline
        }
    }
}
