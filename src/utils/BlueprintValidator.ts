/**
 * Protocol: Zero - Blueprint Validator
 * 驗證社群武器藍圖，確保遊戲平衡
 */

import { WeaponBlueprint, ValidationResult, WeaponStats } from '../types/BlueprintDefinition'

export class BlueprintValidator {
    // =============== Validation Limits ===============

    private static readonly LIMITS = {
        damage: { min: 10, max: 100 },
        fireRate: { min: 200, max: 1200 },
        range: { min: 10, max: 100 },
        magazineSize: { min: 5, max: 50 },
        penetration: { min: 0, max: 100 },
        recoilReduction: { min: 0, max: 0.30 },      // Max 30% recoil reduction from parts
        adsSpeed: { min: 0.2, max: 0.8 },
        barrelLength: { min: 0.5, max: 1.5 }
    }

    // =============== Main Validation Method ===============

    /**
     * Validate a weapon blueprint
     * Returns validation result with errors and warnings
     */
    static validate(blueprint: WeaponBlueprint): ValidationResult {
        const errors: string[] = []
        const warnings: string[] = []

        // 1. Required Fields
        this.validateRequiredFields(blueprint, errors)

        // 2. Stats Validation
        this.validateStats(blueprint.stats, errors, warnings)

        // 3. Components Validation
        this.validateComponents(blueprint, errors, warnings)

        // 4. Metadata Validation
        this.validateMetadata(blueprint, errors)

        return {
            valid: errors.length === 0,
            errors,
            warnings
        }
    }

    // =============== Required Fields Validation ===============

    private static validateRequiredFields(blueprint: WeaponBlueprint, errors: string[]): void {
        if (!blueprint.id || blueprint.id.trim() === '') {
            errors.push('Blueprint ID is required')
        }

        if (!blueprint.name || blueprint.name.trim() === '') {
            errors.push('Blueprint name is required')
        }

        if (!blueprint.author || blueprint.author.trim() === '') {
            errors.push('Author name is required')
        }

        if (!blueprint.components) {
            errors.push('Components configuration is required')
            return
        }

        if (!blueprint.components.receiver) {
            errors.push('Receiver configuration is required')
        }

        if (!blueprint.components.barrel) {
            errors.push('Barrel configuration is required')
        }

        if (!blueprint.components.magazine) {
            errors.push('Magazine configuration is required')
        }

        if (!blueprint.stats) {
            errors.push('Weapon stats are required')
        }
    }

    // =============== Stats Validation ===============

    private static validateStats(stats: WeaponStats, errors: string[], warnings: string[]): void {
        // Damage
        if (stats.damage < this.LIMITS.damage.min || stats.damage > this.LIMITS.damage.max) {
            errors.push(`Damage must be between ${this.LIMITS.damage.min} and ${this.LIMITS.damage.max} (current: ${stats.damage})`)
        }

        // Fire Rate
        if (stats.fireRate < this.LIMITS.fireRate.min || stats.fireRate > this.LIMITS.fireRate.max) {
            errors.push(`Fire rate must be between ${this.LIMITS.fireRate.min} and ${this.LIMITS.fireRate.max} RPM (current: ${stats.fireRate})`)
        }

        // Range
        if (stats.range < this.LIMITS.range.min || stats.range > this.LIMITS.range.max) {
            errors.push(`Range must be between ${this.LIMITS.range.min} and ${this.LIMITS.range.max} meters (current: ${stats.range})`)
        }

        // Magazine Size
        if (stats.magazineSize < this.LIMITS.magazineSize.min || stats.magazineSize > this.LIMITS.magazineSize.max) {
            errors.push(`Magazine size must be between ${this.LIMITS.magazineSize.min} and ${this.LIMITS.magazineSize.max} (current: ${stats.magazineSize})`)
        }

        // Penetration
        if (stats.penetration < this.LIMITS.penetration.min || stats.penetration > this.LIMITS.penetration.max) {
            errors.push(`Penetration must be between ${this.LIMITS.penetration.min} and ${this.LIMITS.penetration.max} (current: ${stats.penetration})`)
        }

        // ADS Speed
        if (stats.adsSpeed < this.LIMITS.adsSpeed.min || stats.adsSpeed > this.LIMITS.adsSpeed.max) {
            errors.push(`ADS speed must be between ${this.LIMITS.adsSpeed.min} and ${this.LIMITS.adsSpeed.max} seconds (current: ${stats.adsSpeed})`)
        }

        // Warnings for potentially overpowered combinations
        if (stats.damage > 80 && stats.fireRate > 800) {
            warnings.push('High damage + high fire rate combination may be overpowered')
        }

        if (stats.penetration > 80 && stats.damage > 60) {
            warnings.push('High penetration + high damage may be unbalanced')
        }

        // Recoil Pattern Validation
        if (!stats.recoilPattern || stats.recoilPattern.length === 0) {
            errors.push('Recoil pattern is required and cannot be empty')
        } else if (stats.recoilPattern.length > 30) {
            warnings.push('Recoil pattern has more than 30 points, may affect performance')
        }
    }

    // =============== Components Validation ===============

    private static validateComponents(blueprint: WeaponBlueprint, errors: string[], warnings: string[]): void {
        const { components } = blueprint

        // Barrel validation
        if (components.barrel) {
            const { length, rangeModifier, velocityModifier } = components.barrel

            if (length < this.LIMITS.barrelLength.min || length > this.LIMITS.barrelLength.max) {
                errors.push(`Barrel length must be between ${this.LIMITS.barrelLength.min} and ${this.LIMITS.barrelLength.max} (current: ${length})`)
            }

            if (rangeModifier < 0.5 || rangeModifier > 1.5) {
                errors.push('Barrel range modifier must be between 0.5 and 1.5')
            }

            if (velocityModifier < 0.7 || velocityModifier > 1.3) {
                errors.push('Barrel velocity modifier must be between 0.7 and 1.3')
            }
        }

        // Stock validation
        if (components.stock) {
            const { recoilReduction, aimStability } = components.stock

            if (recoilReduction > this.LIMITS.recoilReduction.max) {
                errors.push(`Stock recoil reduction cannot exceed ${this.LIMITS.recoilReduction.max * 100}% (current: ${recoilReduction * 100}%)`)
            }

            if (aimStability > 0.25) {
                errors.push('Stock aim stability bonus cannot exceed 25%')
            }
        }

        // Scope validation
        if (components.scope) {
            const { magnification, adsSpeed } = components.scope

            if (magnification < 1.0 || magnification > 8.0) {
                errors.push('Scope magnification must be between 1.0x and 8.0x')
            }

            if (adsSpeed < 0.3 || adsSpeed > 1.0) {
                errors.push('Scope ADS speed modifier must be between 0.3 and 1.0')
            }

            // High magnification should have ADS penalty
            if (magnification > 4.0 && adsSpeed > 0.7) {
                warnings.push('High magnification scopes should have lower ADS speed (< 0.7)')
            }
        }

        // Grip validation
        if (components.grip) {
            const { recoilReduction, adsMovement } = components.grip

            if (recoilReduction > 0.20) {
                errors.push('Grip recoil reduction cannot exceed 20%')
            }

            if (adsMovement < 0.6 || adsMovement > 1.0) {
                errors.push('Grip ADS movement modifier must be between 0.6 and 1.0')
            }
        }

        // Magazine validation
        if (components.magazine) {
            const { capacity, reloadSpeed } = components.magazine

            if (capacity < 5 || capacity > 50) {
                errors.push('Magazine capacity must be between 5 and 50 rounds')
            }

            if (reloadSpeed < 0.7 || reloadSpeed > 1.3) {
                errors.push('Magazine reload speed modifier must be between 0.7 and 1.3')
            }

            // Large magazine should have reload penalty
            if (capacity > 35 && reloadSpeed > 1.0) {
                warnings.push('Large magazines should have reload speed penalty (< 1.0)')
            }
        }
    }

    // =============== Metadata Validation ===============

    private static validateMetadata(blueprint: WeaponBlueprint, errors: string[]): void {
        // Version format (semantic versioning)
        if (blueprint.version && !/^\d+\.\d+\.\d+$/.test(blueprint.version)) {
            errors.push('Version must follow semantic versioning (e.g., "1.0.0")')
        }

        // Created timestamp
        if (blueprint.createdAt) {
            const timestamp = new Date(blueprint.createdAt)
            if (isNaN(timestamp.getTime())) {
                errors.push('Invalid createdAt timestamp format')
            }
        }

        // ID format (alphanumeric + underscores/hyphens only)
        if (blueprint.id && !/^[a-zA-Z0-9_-]+$/.test(blueprint.id)) {
            errors.push('Blueprint ID can only contain letters, numbers, underscores, and hyphens')
        }
    }

    // =============== Quick Validation Helpers ===============

    /**
     * Quick check if blueprint passes basic validation
     */
    static isValid(blueprint: WeaponBlueprint): boolean {
        return this.validate(blueprint).valid
    }

    /**
     * Get human-readable error summary
     */
    static getErrorSummary(blueprint: WeaponBlueprint): string {
        const result = this.validate(blueprint)
        if (result.valid) {
            return 'Blueprint is valid'
        }

        return `Validation failed:\n${result.errors.join('\n')}`
    }
}
