/**
 * UI Manager - Controls all UI states and transitions
 */
export enum GameState {
    MAIN_MENU = 'MAIN_MENU',
    IN_GAME = 'IN_GAME',
    FOUNDRY = 'FOUNDRY',
    PAUSED = 'PAUSED'
}

export class UIManager {
    private currentState: GameState = GameState.MAIN_MENU
    private onStartGameCallback?: () => void
    private onExitGameCallback?: () => void

    // UI Elements
    private mainMenuPanel: HTMLElement | null
    private foundryPanel: HTMLElement | null
    private gameHud: HTMLElement | null
    private crosshair: HTMLElement | null
    private uiHint: HTMLElement | null

    constructor() {
        // Get UI elements
        this.mainMenuPanel = document.getElementById('main-menu-panel')
        this.foundryPanel = document.getElementById('foundry-panel')
        this.gameHud = document.getElementById('game-hud')
        this.crosshair = document.getElementById('crosshair')
        this.uiHint = document.getElementById('ui-hint')

        this.initializeEventListeners()
        this.showMainMenu()
    }

    private initializeEventListeners(): void {
        // Main Menu Buttons
        const startBtn = document.getElementById('btn-start-game')
        const foundryBtn = document.getElementById('btn-foundry')
        const exitBtn = document.getElementById('btn-exit')

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame())
        }
        if (foundryBtn) {
            foundryBtn.addEventListener('click', () => this.showFoundry())
        }
        if (exitBtn) {
            exitBtn.addEventListener('click', () => this.exitGame())
        }

        // Foundry Back Button
        const foundryBackBtn = document.getElementById('btn-foundry-back')
        if (foundryBackBtn) {
            foundryBackBtn.addEventListener('click', () => this.showMainMenu())
        }

        // ESC key to return to menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentState === GameState.IN_GAME) {
                this.showMainMenu()
            }
        })
    }

    showMainMenu(): void {
        this.currentState = GameState.MAIN_MENU
        this.hideAll()
        if (this.mainMenuPanel) this.mainMenuPanel.style.display = 'flex'

        // Exit pointer lock
        if (document.pointerLockElement) {
            document.exitPointerLock()
        }

        console.log('[UI] Main Menu displayed')
    }

    showFoundry(): void {
        this.currentState = GameState.FOUNDRY
        this.hideAll()
        if (this.foundryPanel) this.foundryPanel.style.display = 'flex'
        console.log('[UI] Foundry displayed')
    }

    startGame(): void {
        this.currentState = GameState.IN_GAME
        this.hideAll()
        if (this.gameHud) this.gameHud.style.display = 'block'
        if (this.crosshair) this.crosshair.style.display = 'block'

        // Request pointer lock immediately when Start Game is clicked
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
        if (canvas) {
            canvas.requestPointerLock()
            console.log('[UI] Pointer lock requested')
        }

        // Trigger game start callback
        if (this.onStartGameCallback) {
            this.onStartGameCallback()
        }

        console.log('[UI] Game started')
    }

    exitGame(): void {
        if (this.onExitGameCallback) {
            this.onExitGameCallback()
        } else {
            // Default: close window
            window.close()
        }
    }

    private hideAll(): void {
        if (this.mainMenuPanel) this.mainMenuPanel.style.display = 'none'
        if (this.foundryPanel) this.foundryPanel.style.display = 'none'
        if (this.gameHud) this.gameHud.style.display = 'none'
        if (this.crosshair) this.crosshair.style.display = 'none'
        if (this.uiHint) this.uiHint.style.display = 'none'
    }

    getCurrentState(): GameState {
        return this.currentState
    }

    onStartGame(callback: () => void): void {
        this.onStartGameCallback = callback
    }

    onExitGame(callback: () => void): void {
        this.onExitGameCallback = callback
    }
}
