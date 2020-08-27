"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const kubeScore = require('./kubescore');
const core = require('@actions/core');
const github = require('@actions/github');
const ignoreExitCode = core.getInput('ignore-exit-code');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const kubeScoreVersion = core.getInput('kube-score-version');
            console.log(`Selected kube-score ${kubeScoreVersion || 'latest'} version!`);
            const manifestsFolders = core.getInput('manifests-folders');
            if (!manifestsFolders) {
                core.setFailed('[FATAL] Input for manifests-folders is mandatory');
            }
            const foldersArray = manifestsFolders.split(',');
            yield kubeScore.downloadKubeScore();
            yield kubeScore.runKubeScore(foldersArray);
            core.setOutput('score', 90);
            core.setOutput('raw-output', 'Just testing');
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
process.on('unhandledRejection', () => {
    if (ignoreExitCode) {
        core.setFailed('[KUBE-SCORE] Scan failed...');
    }
    else {
        core.error('[KUBE-SCORE] Scan failed...');
    }
});
main();
