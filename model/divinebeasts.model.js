module.exports = (() => {
    const VahMedoh = require('./vahmedoh.model.js');
    const VahRudania = require('./vahrudania.model.js');
    const VahRuta = require('./vahruta.model.js');
    const VahNaboris = require('./vahnaboris.model.js');
    const FinalTrial = require('./finaltrial.model.js');

    return {
        read: (saveFile, effectMapPath) => {
            return {
                vahmedoh: VahMedoh.read(saveFile, effectMapPath),
                vahrudania: VahRudania.read(saveFile, effectMapPath),
                vahruta: VahRuta.read(saveFile, effectMapPath),
                vahnaboris: VahNaboris.read(saveFile, effectMapPath),
                finaltrial: FinalTrial.read(saveFile, effectMapPath)
            };
        },
        write: (modelJson, saveFile, options, effectMapPath) => {
            if (!modelJson) {
                return Promise.resolve();
            }
            return VahMedoh.write(modelJson.vahmedoh, saveFile, options, effectMapPath)
                .then(() => VahRudania.write(modelJson.vahrudania, saveFile, options, effectMapPath))
                .then(() => VahRuta.write(modelJson.vahruta, saveFile, options, effectMapPath))
                .then(() => VahNaboris.write(modelJson.vahnaboris, saveFile, options, effectMapPath))
                .then(() => FinalTrial.write(modelJson.finaltrial, saveFile, options, effectMapPath));
        }
    };
})();