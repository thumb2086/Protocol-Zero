export interface IDamageable {
    health: number
    maxHealth: number
    takeDamage(amount: number): void
    isDead(): boolean
}
