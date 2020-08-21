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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const kubeScoreVersion = core.getInput('kube-score-version');
            console.log(`Selected kube-score version ${kubeScoreVersion}!`);
            const manifestsFolders = core.getInput('manifests-folders');
            yield kubeScore.downloadKubeScore();
            yield kubeScore.runKubeScore();
            core.setOutput("score", 90);
            core.setOutput("raw-output", "Just testing");
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
main();
