module.exports = (name, newName, knownValue, knownPreviousValue, filterKnownOffsets, nonVariable, autosave, knownDependencies) => {
    const saveFileUtils = require('./save-file-utils.js');
    const buildRecursiveSearcher = require('./build-recursive-searcher.js');
    const resultExporter = require('./json-result-exporter.js');
    const fs = require('fs');
    const CONFIG = require('./config.js');
    const folderUtils = require('./folder-utils.js');
    const mapFileUtils = require('./map-file-utils.js');

    const changesFilename = name + '.raw.changes';
    const changesFilepath = CONFIG.rawchangespath + changesFilename;
    const saveFilepath = `${CONFIG.savepath}game_data.sav`;
    const captionImagepath = `${CONFIG.savepath}caption.jpg`;
    const tempCaptionImagepath = `${CONFIG.tempoutputpath}caption.temp.jpg`;

    const args = process.argv.slice(3);

    folderUtils.buildFoldersIfTheyDoNotExist(tempCaptionImagepath);

    const offsetFilter = (() => {
        if (filterKnownOffsets) {
            return mapFileUtils.getKnownOffsetsFilter();
        } else {
            return () => true;
        }
    })();

    const unfilteredUnapplyChanges = saveFileUtils.getChangesToUnapply(changesFilepath);
    const unfilteredApplyChanges = saveFileUtils.getChangesToApply(changesFilepath);
    const allChangesToApply = unfilteredApplyChanges.filter((address, i) => {
        return (knownValue === undefined || address.value === knownValue) && (knownPreviousValue === undefined || unfilteredUnapplyChanges[i].value === knownPreviousValue);
    }).filter(offsetFilter);
    const allChangesToUnapply = unfilteredUnapplyChanges.filter((address, i) => {
        return (knownValue === undefined || unfilteredApplyChanges[i] && unfilteredApplyChanges[i].value === knownValue) && (knownPreviousValue === undefined || address.value === knownPreviousValue);
    }).filter(offsetFilter);

    if (allChangesToApply.length > 0 && allChangesToUnapply.length > 0) {
        fs.renameSync(captionImagepath, tempCaptionImagepath);
        fs.copyFileSync(CONFIG.placeholderImagepath, captionImagepath);

        saveFileUtils.withBinaryFileSync(saveFilepath, (binary) => {
            const recursiveSearcher = buildRecursiveSearcher(saveFilepath, binary);

            const results = recursiveSearcher.search(allChangesToApply, allChangesToUnapply, (a) => a);

            const mightSaveAsVariableReasons = [];
            if (!nonVariable && (knownValue !== undefined || knownPreviousValue !== undefined)) {
                mightSaveAsVariableReasons.push('You searched for a known value.');
            }

            resultExporter(results, newName || name, mightSaveAsVariableReasons, false, undefined, autosave, knownDependencies);
        });

        fs.unlinkSync(captionImagepath);
        fs.renameSync(tempCaptionImagepath, captionImagepath);
    } else {
        console.log('No testable changes available with your current filter settings.');
    }
};