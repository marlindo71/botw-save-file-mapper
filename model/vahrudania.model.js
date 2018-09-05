module.exports = (() => {
    const CONFIG = require('../config.js');
    const changeReader = require('../read-changes.js');
    const changeWriter = require('../batch-apply-changes.js');
    const defaultEffectMap = `${CONFIG.exportpath}effectmap.json`;

    const getChangeReader = (saveFile, effectMapPath) => {
        return (keys, withLogging) => {
            return changeReader(saveFile)(effectMapPath || defaultEffectMap, keys, withLogging);
        };
    };
    const getChangeWriter = (saveFile, effectMapPath) => {
        return (keys, skipSoftDependencies, withLogging) => {
            return changeWriter(saveFile)(effectMapPath || defaultEffectMap, keys, skipSoftDependencies, withLogging);
        };
    };

    return {
        read: (saveFile, effectMapPath) => {
            const readChanges = getChangeReader(saveFile, effectMapPath);

            const mapValues = readChanges([
                'divinebeasts.vahrudania.active',
                'divinebeasts.vahrudania.complete',
                'divinebeasts.vahrudania.found',
                'divinebeasts.vahrudania.map.obtained',
                'divinebeasts.vahrudania.terminalsremaining',
                'divinebeasts.vahrudania.terminal1.on',
                'divinebeasts.vahrudania.terminal2.on',
                'divinebeasts.vahrudania.terminal3.on',
                'divinebeasts.vahrudania.terminal4.on',
                'divinebeasts.vahrudania.terminal5.on',
                'divinebeasts.vahrudania.heartcontainer.available',
                'divinebeasts.vahrudania.heartcontainer.taken'
            ]);

            return {
                active: mapValues['divinebeasts.vahrudania.active'],
                complete: mapValues['divinebeasts.vahrudania.complete'],
                found: mapValues['divinebeasts.vahrudania.found'],
                map: mapValues['divinebeasts.vahrudania.map.obtained'],
                terminalsremaining: mapValues['divinebeasts.vahrudania.terminalsremaining'],
                terminal1: mapValues['divinebeasts.vahrudania.terminal1.on'],
                terminal2: mapValues['divinebeasts.vahrudania.terminal2.on'],
                terminal3: mapValues['divinebeasts.vahrudania.terminal3.on'],
                terminal4: mapValues['divinebeasts.vahrudania.terminal4.on'],
                terminal5: mapValues['divinebeasts.vahrudania.terminal5.on'],
                heartcontaineravailable: mapValues['divinebeasts.vahrudania.heartcontainer.available'],
                heartcontainertaken: mapValues['divinebeasts.vahrudania.heartcontainer.taken']
            };
        },
        write: (modelJson, saveFile, effectMapPath) => {
            if (!modelJson) {
                return Promise.resolve();
            }
            const writeChanges = getChangeWriter(saveFile, effectMapPath);

            const keys = [
                `divinebeasts.vahrudania.terminalsremaining=${modelJson.terminalsremaining}`
            ];

            const addKeyIfTrue = (val, key) => {
                if (val === true) {
                    keys.push(key);
                }
            };

            const addKeyIfFalse = (val, key) => {
                if (val === false) {
                    keys.push(key);
                }
            };

            addKeyIfTrue(modelJson.active, 'divinebeasts.vahrudania.active');
            addKeyIfFalse(modelJson.active, 'divinebeasts.vahrudania.inactive');

            addKeyIfTrue(modelJson.complete, 'divinebeasts.vahrudania.complete');
            addKeyIfFalse(modelJson.complete, 'divinebeasts.vahrudania.incomplete');

            addKeyIfTrue(modelJson.found, 'divinebeasts.vahrudania.found');
            addKeyIfFalse(modelJson.found, 'divinebeasts.vahrudania.notfound');

            addKeyIfTrue(modelJson.map, 'divinebeasts.vahrudania.map.obtained');
            addKeyIfFalse(modelJson.map, 'divinebeasts.vahrudania.map.notobtained');
            
            addKeyIfTrue(modelJson.terminal1, 'divinebeasts.vahrudania.terminal1.on');
            addKeyIfFalse(modelJson.terminal1, 'divinebeasts.vahrudania.terminal1.off');
            
            addKeyIfTrue(modelJson.terminal2, 'divinebeasts.vahrudania.terminal2.on');
            addKeyIfFalse(modelJson.terminal2, 'divinebeasts.vahrudania.terminal2.off');
            
            addKeyIfTrue(modelJson.terminal3, 'divinebeasts.vahrudania.terminal3.on');
            addKeyIfFalse(modelJson.terminal3, 'divinebeasts.vahrudania.terminal3.off');
            
            addKeyIfTrue(modelJson.terminal4, 'divinebeasts.vahrudania.terminal4.on');
            addKeyIfFalse(modelJson.terminal4, 'divinebeasts.vahrudania.terminal4.off');
            
            addKeyIfTrue(modelJson.terminal5, 'divinebeasts.vahrudania.terminal5.on');
            addKeyIfFalse(modelJson.terminal5, 'divinebeasts.vahrudania.terminal5.off');

            addKeyIfTrue(modelJson.heartcontaineravailable, 'divinebeasts.vahrudania.heartcontainer.available');
            addKeyIfFalse(modelJson.heartcontaineravailable, 'divinebeasts.vahrudania.heartcontainer.notavailable');

            addKeyIfTrue(modelJson.heartcontainertaken, 'divinebeasts.vahrudania.heartcontainer.taken');
            addKeyIfFalse(modelJson.heartcontainertaken, 'divinebeasts.vahrudania.heartcontainer.nottaken');

            return writeChanges(keys);
        }
    };
})();
