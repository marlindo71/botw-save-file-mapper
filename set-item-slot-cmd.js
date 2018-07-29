const fs = require('fs');
const offsetSetter = require('./offset-setter.js');
const itemFileUtils = require('./item-file-utils.js');
const CONFIG = require('./config.js');
const nameGetter = require('./name-getter.js');
const objUtils = require('./obj-utils.js');
const getItemSlotStructure = require('./get-item-slot-structure.js');
const slotInfo = require('./slot-info.js');
const foodduration = require('./encoders_decoders/foodduration.js');

const slot = parseInt(process.argv[3]);
const saveFile = !!process.argv[5] ? (CONFIG.snapshotspath + process.argv[5]) : CONFIG.savepath + 'game_data.sav';

const bonusTypes = {
    ATTACK: 0x1,
    DURABILITY: 0x2,
    CRITICAL: 0x4,
    LONGTHROW: 0x8,
    FIVESHOTS: 0x10,
    THREESHOTS: 0x20,
    QUICKSHOT: 0x40,
    SHIELDSURF: 0x80,
    SHIELDGUARD: 0x100,
    ATTACKPLUS: 0x80000001,
    DURABILITYPLUS: 0x80000002,
    CRITICALPLUS: 0x80000004,
    LONGTHROWPLUS: 0x80000008,
    FIVESHOTSPLUS: 0x80000010,
    THREESHOTSPLUS: 0x80000020,
    QUICKSHOTPLUS: 0x80000040,
    SHIELDSURFPLUS: 0x80000080,
    SHIELDGUARDPLUS: 0x80000100
};

const foodBonusTypes = {
    HEARTY: 0x40000000,
    CHILLY: 0x40800000,
    SPICY: 0x40a00000,
    ELECTRO: 0x40c00000,
    MIGHTY: 0x41200000,
    TOUGH: 0x41300000,
    SNEAKY: 0x41400000,
    HASTY: 0x41500000,
    ENERGIZING: 0x41600000,
    ENDURING: 0x41700000,
    FIREPROOF: 0x41800000
};

const maxFoodBonusAmounts = {
    HEARTY: 0xFFFFFFFF,
    CHILLY: 2,
    SPICY: 2,
    ELECTRO: 3,
    MIGHTY: 3,
    TOUGH: 3,
    SNEAKY: 3,
    HASTY: 3,
    ENERGIZING: 0xFFFFFFFF,
    ENDURING: 0xFFFFFFFF,
    FIREPROOF: 0x2
};

const foodBonusAmounts = [
    0,
    0x3f800000,
    0x40000000,
    0x40400000
];

const getBonusType = (name, category) => {
    if (category == 'food') {
        return foodBonusTypes[name.toUpperCase()];
    } else {
        return bonusTypes[name.toUpperCase()];
    }
}

const category = nameGetter.getOrUndefined(process.argv[2], 'Item category: ', 'Unnamed categories not allowed.');
const categoryFilename = itemFileUtils.getCategoryFilepath(category.toLowerCase());

if (!!categoryFilename) {
    const slotStructure = getItemSlotStructure(saveFile);

    const baseSlot = slotStructure[category].first + slot - 1;

    if (!!baseSlot || baseSlot === 0) {
        const nameStr = nameGetter.getOrUndefined(process.argv[4], 'Item name: ', 'Unnamed items not allowed.');

        if (!!nameStr) {
            const [nameWithBonus, quantityStr] = nameStr.split('x');
            const [name, bonusType, bonusAmount, bonusDuration] = nameWithBonus.split('+');
            const quantity = parseInt(quantityStr);
            
            const json = itemFileUtils.getFileAsJsonOrEmptyJsObject(categoryFilename);

            const entries = json[name];

            if (!!entries) {
                const base = slotInfo.getOffsets(baseSlot, slot - 1, category);

                entries.forEach(entry => {
                    offsetSetter(base.item + entry.offset, entry.value, saveFile);
                });
                if (!!quantity) {
                    offsetSetter(base.quantity, quantity, saveFile);
                }
                if (!!bonusType) {
                    console.log(`0x${base.bonus.type.toString(16)} => 0x${getBonusType(bonusType, category).toString(16)}`);
                    offsetSetter(base.bonus.type, getBonusType(bonusType, category), saveFile);
                    if (bonusAmount !== undefined) {
                        if (category === 'food') {
                            const maxBonus = maxFoodBonusAmounts[bonusType.toUpperCase()];
                            const bonus = bonusAmount > maxBonus ? maxBonus : bonusAmount;
                            if (foodBonusAmounts[bonus] !== undefined) {
                                offsetSetter(base.bonus.amount, foodBonusAmounts[bonus], saveFile);
                            }
                        } else {
                            offsetSetter(base.bonus.amount, bonusAmount || 0, saveFile);
                        }
                    }
                    if (!!bonusDuration && base.bonus.duration) {
                        offsetSetter(base.bonus.duration, foodduration.encode(bonusDuration || '00:00'), saveFile);
                    }
                }
            } else {
                console.log(`No entries found for '${name}' in ${category}.`);
            }
        }
    }
} else {
    console.log('Category not recognized.');
}
