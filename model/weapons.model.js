module.exports = (() => {
    const Offsets = require('../offsets.js');
    const OffsetChecker = require('../offset-checker.js');
    const OffsetSetter = require('../offset-setter.js');
    const getItemSlotStructure = require('../get-item-slot-structure.js');
    const mapItemSlots = require('./map-item-slots.js');
    const writeItemSlots = require('./write-item-slots.js');

    const bonusTypes = {
        0x1: 'attack',
        0x2: 'durability',
        0x4: 'critical',
        0x8: 'longthrow',
        0x80000001: 'attackplus',
        0x80000002: 'durabilityplus',
        0x80000004: 'criticalplus',
        0x80000008: 'longthrowplus'
    };

    const bonusEnum = {
        'attack': 0x1,
        'durability': 0x2,
        'critical': 0x4,
        'longthrow': 0x8,
        'attackplus': 0x80000001,
        'durabilityplus': 0x80000002,
        'criticalplus': 0x80000004,
        'longthrowplus': 0x80000008
    };

    const weaponStashOffset = 0x00085048;

    const getWeaponSlots = (saveFile) => {
        return mapItemSlots(saveFile, 'weapons', (item, slot, slotInCategory) => {
            const equippedOffset = Offsets.getEquippedSlotOffset(slot);
            const durabilityOffset = Offsets.getQuantitiesOffset(slot);

            const equipped = !!OffsetChecker(equippedOffset, saveFile);
            const durability = OffsetChecker(durabilityOffset, saveFile);
                    
            const bonus = (() => {
                const typeOffset = Offsets.getBonusTypeOffset(slotInCategory, 'weapons');
                const amountOffset = Offsets.getBonusAmountOffset(slotInCategory, 'weapons');

                const type = bonusTypes[OffsetChecker(typeOffset, saveFile)];
                if (type !== undefined) {
                    const amount = OffsetChecker(amountOffset, saveFile);
                    return {
                        amount: amount,
                        type: type
                    };
                } else {
                    return undefined;
                }
            })();

            return {
                name: item.name,
                equipped: equipped,
                durability: durability,
                bonus: bonus
            };
        });
    };

    return {
        read: (saveFile) => {
            return {
                stash: OffsetChecker(weaponStashOffset, saveFile),
                slots: getWeaponSlots(saveFile)
            };
        },
        write: (modelJson, saveFile) => {
            OffsetSetter(weaponStashOffset, modelJson.stash, saveFile);
            writeItemSlots(saveFile, modelJson.slots, 'weapons', (item, slot, slotInCategory) => {
                const equippedOffset = Offsets.getEquippedSlotOffset(slot);
                const durabilityOffset = Offsets.getQuantitiesOffset(slot);

                OffsetSetter(equippedOffset, item.equipped ? 1 : 0, saveFile);
                OffsetSetter(durabilityOffset, item.durability, saveFile);

                const typeOffset = Offsets.getBonusTypeOffset(slotInCategory, 'weapons');
                const amountOffset = Offsets.getBonusAmountOffset(slotInCategory, 'weapons');
                
                if (!!item.bonus) {
                    OffsetSetter(typeOffset, bonusEnum[item.bonus.type] || 0, saveFile);
                    OffsetSetter(amountOffset, item.bonus.amount, saveFile);
                } else {
                    OffsetSetter(typeOffset, 0, saveFile);
                    OffsetSetter(amountOffset, 0, saveFile);
                }
            });
        }
    };
})();