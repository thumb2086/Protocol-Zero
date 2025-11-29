import { IPCBridge } from '../utils/IPCBridge'
import { WeaponMetadata } from '../utils/FoundryLoader'

export class FoundryController {
    private overviewPanel: HTMLElement | null
    private detailPanel: HTMLElement | null
    private partPicker: HTMLElement | null
    private ipcBridge: IPCBridge

    private currentWeaponId: string | null = null

    // Mock Part Data (In real app, this would come from a PartsLoader)
    private availableParts = {
        scope: [
            { id: 'red_dot', name: 'Red Dot', type: 'scope' },
            { id: 'holo', name: 'Holographic', type: 'scope' },
            { id: 'sniper', name: 'Sniper Scope', type: 'scope' }
        ],
        grip: [
            { id: 'vertical', name: 'Vertical Grip', type: 'grip' },
            { id: 'angled', name: 'Angled Grip', type: 'grip' }
        ],
        barrel: [
            { id: 'std', name: 'Standard', type: 'barrel' },
            { id: 'long', name: 'Long Barrel', type: 'barrel' },
            { id: 'short', name: 'Short Barrel', type: 'barrel' }
        ],
        skin: [
            { id: 'default', name: 'Default', type: 'skin' },
            { id: 'flux', name: 'Flux', type: 'skin' },
            { id: 'gaia', name: 'Gaia', type: 'skin' },
            { id: 'voxel', name: 'Voxel', type: 'skin' }
        ]
    }

    constructor(ipcBridge: IPCBridge) {
        this.ipcBridge = ipcBridge
        this.overviewPanel = document.getElementById('foundry-overview')
        this.detailPanel = document.getElementById('foundry-detail')
        this.partPicker = document.getElementById('part-picker')

        this.initializeEvents()
    }

    private initializeEvents() {
        // Back button in header (handled by UIManager usually, but we need to reset view)
        const backBtn = document.getElementById('btn-foundry-back')
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.showOverview()
            })
        }

        // Close picker button
        const closePickerBtn = document.getElementById('btn-close-picker')
        if (closePickerBtn) {
            closePickerBtn.addEventListener('click', () => {
                if (this.partPicker) this.partPicker.style.display = 'none'
            })
        }

        // Part slot buttons
        const partBtns = document.querySelectorAll('.part-btn')
        partBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = (e.currentTarget as HTMLElement).dataset.slot
                if (slot) this.openPartPicker(slot)
            })
        })
    }

    public populateWeapons(weapons: WeaponMetadata[]) {
        const grid = document.getElementById('weapon-grid')
        if (!grid) return

        grid.innerHTML = ''

        if (weapons.length === 0) {
            grid.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No weapons found.</p>'
            return
        }

        weapons.forEach(weapon => {
            const card = document.createElement('div')
            card.className = 'weapon-card'
            card.innerHTML = `
                <h3>${weapon.name}</h3>
                <p>${weapon.type}</p>
                <div class="weapon-type">${weapon.type}</div>
            `
            card.addEventListener('click', () => {
                this.selectWeapon(weapon)
            })
            grid.appendChild(card)
        })
    }

    public selectWeapon(weapon: WeaponMetadata) {
        this.currentWeaponId = weapon.id
        console.log(`[Foundry] Selected ${weapon.name}`)

        // Switch to detail view
        this.showDetail()

        // Request weapon model update in 3D scene
        this.ipcBridge.requestWeaponChange(weapon.id)

        // Update Stats (Mock data for now)
        this.updateStats(weapon)

        // Reset Part Buttons
        this.updatePartButton('scope', 'None')
        this.updatePartButton('grip', 'None')
        this.updatePartButton('barrel', 'Standard')
        this.updatePartButton('skin', 'Default')
    }

    private updateStats(weapon: WeaponMetadata) {
        // In a real app, these would come from weapon.stats
        // For now, we just randomize slightly to show effect
        const damageFill = document.querySelector('.stats-panel .stat-bar-container:nth-child(2) .fill') as HTMLElement
        const fireRateFill = document.querySelector('.stats-panel .stat-bar-container:nth-child(3) .fill') as HTMLElement

        if (damageFill) damageFill.style.width = weapon.type === 'Sniper' ? '95%' : '40%'
        if (fireRateFill) fireRateFill.style.width = weapon.type === 'SMG' ? '90%' : '60%'
    }

    private showOverview() {
        if (this.overviewPanel) this.overviewPanel.style.display = 'block'
        if (this.detailPanel) this.detailPanel.style.display = 'none'
        if (this.partPicker) this.partPicker.style.display = 'none'
    }

    private showDetail() {
        if (this.overviewPanel) this.overviewPanel.style.display = 'none'
        if (this.detailPanel) this.detailPanel.style.display = 'block'
    }

    private openPartPicker(slot: string) {
        if (!this.partPicker) return

        const pickerGrid = document.getElementById('picker-grid')
        if (!pickerGrid) return

        pickerGrid.innerHTML = ''
        const parts = this.availableParts[slot as keyof typeof this.availableParts] || []

        parts.forEach((part: { id: string; name: string; type: string }) => {
            const item = document.createElement('div')
            item.className = 'picker-item'
            item.innerHTML = `
                <div style="font-weight:bold; color:#00e5ff;">${part.name}</div>
                <div style="font-size:12px; color:rgba(255,255,255,0.5);">${part.type}</div>
            `
            item.addEventListener('click', () => {
                this.equipPart(slot, part)
            })
            pickerGrid.appendChild(item)
        })

        // Add "Remove" option
        const removeBtn = document.createElement('div')
        removeBtn.className = 'picker-item'
        removeBtn.innerHTML = `<div style="color:#ff4655;">REMOVE</div>`
        removeBtn.addEventListener('click', () => {
            this.equipPart(slot, null)
        })
        pickerGrid.appendChild(removeBtn)

        this.partPicker.style.display = 'flex'

        // Update title
        const title = this.partPicker.querySelector('h4')
        if (title) title.innerText = `SELECT ${slot.toUpperCase()}`
    }

    private equipPart(slot: string, part: any) {
        console.log(`[Foundry] Equipping ${part ? part.name : 'None'} to ${slot}`)

        // Update UI button
        this.updatePartButton(slot, part ? part.name : 'None')

        // Close picker
        if (this.partPicker) this.partPicker.style.display = 'none'

        // Send to Main Process / 3D Scene
        // We send the part ID (e.g. 'red_dot') as the 'style' or 'id' for the factory
        const partId = part ? part.id : null

        // For now, we assume the part ID maps directly to the style expected by ComponentFactory
        // e.g. scope: 'red_dot', grip: 'angled'

        // We need to send this to the main process, which will then tell the renderer (WeaponAssembler) to update
        // Actually, since we are IN the renderer, we can potentially access WeaponAssembler directly if we expose it,
        // OR we use the IPC bridge to simulate the full loop.
        // Let's use a direct event dispatch or IPC bridge if available.

        if (window.api && window.api.weapon) {
            // This is a bit circular: Renderer UI -> Main -> Renderer 3D
            // But it ensures state sync.
            // However, our IPC bridge might not have a "equipPart" method yet.
            // Let's check IPCBridge.ts.
            // It doesn't. We should probably add it or just emit a custom event.
        }

        // Direct dispatch for now (Simulating IPC response)
        // We need to trigger the logic in main.ts that listens for part changes.
        // Since main.ts listens to window.api.weapon.onPartEquipped, we can't easily trigger that from here without a real IPC call.

        // WORKAROUND: Dispatch a custom DOM event that main.ts listens to? 
        // No, main.ts is the entry point.

        // Let's use the IPCBridge to send a message if possible, or just add a callback.
        // For this MVP, let's assume we can emit an event.

        const event = new CustomEvent('foundry-equip-part', {
            detail: { slot, partData: partId }
        })
        window.dispatchEvent(event)
    }

    private updatePartButton(slot: string, name: string) {
        const btn = document.querySelector(`.part-btn[data-slot="${slot}"]`)
        if (btn) {
            const nameEl = btn.querySelector('.part-name')
            if (nameEl) nameEl.textContent = name
        }
    }
}
