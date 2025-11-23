export class HUDController {
    private healthElement: HTMLElement | null
    private armorElement: HTMLElement | null
    private ammoElement: HTMLElement | null
    private magazineElement: HTMLElement | null
    private abilityElements: HTMLElement[] = []

    constructor() {
        this.healthElement = document.getElementById('health-value')
        this.armorElement = document.getElementById('armor-value')
        this.ammoElement = document.getElementById('ammo-value')
        this.magazineElement = document.getElementById('magazine-value')

        // Initialize abilities
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById(`ability-${i}`)
            if (el) this.abilityElements.push(el)
        }
    }

    public updateHealth(current: number, max: number = 100): void {
        if (this.healthElement) {
            this.healthElement.innerText = Math.max(0, Math.floor(current)).toString()
            // Add color change logic for low health if needed
            if (current < 30) {
                this.healthElement.style.color = '#ff4444'
            } else {
                this.healthElement.style.color = 'white'
            }
        }
    }

    public updateArmor(current: number, max: number = 50): void {
        if (this.armorElement) {
            this.armorElement.innerText = Math.max(0, Math.floor(current)).toString()
        }
    }

    public updateAmmo(current: number, reserve: number): void {
        if (this.ammoElement) {
            this.ammoElement.innerText = current.toString()
        }
        if (this.magazineElement) {
            this.magazineElement.innerText = reserve.toString()
        }
    }

    public setAbilityState(index: number, state: 'ready' | 'cooldown' | 'active', cooldownPercent: number = 0): void {
        if (index < 0 || index >= this.abilityElements.length) return

        const el = this.abilityElements[index]
        el.className = `ability-icon ${state}`

        // Handle cooldown overlay if we implement it in CSS
    }

    public showKillFeed(killer: string, victim: string, weapon: string, isHeadshot: boolean): void {
        const feedContainer = document.getElementById('kill-feed')
        if (!feedContainer) return

        const item = document.createElement('div')
        item.className = 'kill-feed-item'
        item.innerHTML = `
            <span class="killer">${killer}</span>
            <span class="weapon">[${weapon}]</span>
            <span class="victim">${victim}</span>
            ${isHeadshot ? '<span class="headshot">⌖</span>' : ''}
        `

        feedContainer.appendChild(item)

        // Remove after 5 seconds
        setTimeout(() => {
            item.style.opacity = '0'
            setTimeout(() => item.remove(), 500)
        }, 5000)
    }
}
