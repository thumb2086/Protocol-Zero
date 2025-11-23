// client/systems/ShopSystem.js
import { WEAPONS } from '@configs/weapons.js';

export default class ShopSystem {
    constructor({ network, ui, graphics }) {
        this.network = network;
        this.ui = ui;
        this.graphics = graphics;

        this.money = 800; // 初始金額
        this.isOpen = false;
        this.purchasedItems = {
            weapon: null,
            shield: null
        };

        // 綁定 DOM 元素
        this.buyMenuEl = document.getElementById('buy-menu');
        this.moneyDisplay = document.getElementById('money-amount');
        this.closeBuyBtn = document.getElementById('close-buy-menu');

        this._bindEvents();
    }

    _bindEvents() {
        // 按 B 鍵打開/關閉商店
        document.addEventListener('keydown', (e) => {
            if (e.key === 'b' || e.key === 'B') {
                if (this.canOpenShop()) {
                    this.toggle();
                }
            }
        });

        // 關閉按鈕
        this.closeBuyBtn?.addEventListener('click', () => this.close());

        // 購買物品
        const weaponItems = document.querySelectorAll('.weapon-item');
        weaponItems.forEach(item => {
            item.addEventListener('click', () => {
                const weaponId = item.dataset.weapon;
                const itemId = item.dataset.item;
                const price = parseInt(item.dataset.price || 0);

                if (weaponId) {
                    this.buyWeapon(weaponId, price);
                } else if (itemId) {
                    this.buyItem(itemId, price);
                }
            });
        });
    }

    canOpenShop() {
        // 只有在回合開始前或買時間內可以打開商店
        // 這裡簡化為遊戲中隨時可開（訓練模式）
        return !document.pointerLockElement;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.buyMenuEl) return;
        this.isOpen = true;
        this.buyMenuEl.classList.add('active');
        this.updateMoneyDisplay();
        console.log('[ShopSystem] 商店已開啟');
    }

    close() {
        if (!this.buyMenuEl) return;
        this.isOpen = false;
        this.buyMenuEl.classList.remove('active');
        console.log('[ShopSystem] 商店已關閉');
    }

    updateMoneyDisplay() {
        if (this.moneyDisplay) {
            this.moneyDisplay.textContent = `$${this.money}`;
        }
    }

    buyWeapon(weaponId, price) {
        if (this.money < price) {
            console.log('[ShopSystem] 金額不足', weaponId, price);
            this.showError('金額不足！');
            return;
        }

        // 扣款
        this.money -= price;
        this.purchasedItems.weapon = weaponId;
        this.updateMoneyDisplay();

        console.log('[ShopSystem] 已購買武器', weaponId, '剩餘金額:', this.money);
        this.showSuccess(`已購買 ${weaponId}`);

        // 通知服務器（多人模式）
        if (this.network) {
            this.network.emit('buyWeapon', { weaponId, price });
        }

        // 如果有武器系統，直接切換武器
        if (window.weaponSystem) {
            window.weaponSystem.setWeapon(weaponId, 0);
        }

        // 自動關閉菜單（可選）
        // this.close();
    }

    buyItem(itemId, price) {
        if (this.money < price) {
            console.log('[ShopSystem] 金額不足', itemId, price);
            this.showError('金額不足！');
            return;
        }

        // 檢查是否已購買同類型護甲
        if (itemId.includes('shield') && this.purchasedItems.shield) {
            console.log('[ShopSystem] 已擁有護甲');
            this.showError('已擁有護甲！');
            return;
        }

        // 扣款
        this.money -= price;

        if (itemId === 'light_shield') {
            this.purchasedItems.shield = 25; // 輕型護甲 +25 HP
        } else if (itemId === 'heavy_shield') {
            this.purchasedItems.shield = 50; // 重型護甲 +50 HP
        }

        this.updateMoneyDisplay();
        console.log('[ShopSystem] 已購買物品', itemId, '剩餘金額:', this.money);
        this.showSuccess(`已購買 ${itemId}`);

        // 通知服務器
        if (this.network) {
            this.network.emit('buyItem', { itemId, price });
        }
    }

    // 回合獎勵
    addMoney(amount, reason = '') {
        this.money = Math.min(9000, this.money + amount); // 最高 $9000
        this.updateMoneyDisplay();
        console.log(`[ShopSystem] +$${amount}`, reason);
    }

    // 擊殺獎勵
    onKill() {
        this.addMoney(200, '擊殺獎勵');
    }

    // 回合勝利獎勵
    onRoundWin() {
        this.addMoney(3000, '回合勝利');
    }

    // 回合失敗獎勵（有連敗補償）
    onRoundLose(loseStreak = 0) {
        const base = 1900;
        const bonus = Math.min(loseStreak * 500, 1500); // 最高 +$1500
        this.addMoney(base + bonus, '回合失敗 + 連敗補償');
    }

    // 炸彈安裝/拆除獎勵
    onBombObjective() {
        this.addMoney(300, '炸彈目標獎勵');
    }

    // 重置購買（新回合開始）
    resetPurchases() {
        this.purchasedItems = {
            weapon: null,
            shield: null
        };
        console.log('[ShopSystem] 已重置本回合購買記錄');
    }

    // 顯示錯誤訊息
    showError(message) {
        this._showNotification(message, 'error');
    }

    // 顯示成功訊息
    showSuccess(message) {
        this._showNotification(message, 'success');
    }

    _showNotification(message, type = 'info') {
        // 簡易通知系統（可以改用更好的 UI）
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#f44' : '#4f4'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-family: 'Noto Sans TC', sans-serif;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // 獲取當前金額
    getMoney() {
        return this.money;
    }

    // 設定金額（用於服務器同步）
    setMoney(amount) {
        this.money = Math.max(0, Math.min(9000, amount));
        this.updateMoneyDisplay();
    }
}
