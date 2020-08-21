System.register([], function (exports_1, context_1) {
    "use strict";
    var kubeScore, core, github;
    var __moduleName = context_1 && context_1.id;
    async function main() {
        try {
            const kubeScoreVersion = core.getInput('kube-score-version');
            console.log(`Selected kube-score version ${kubeScoreVersion}!`);
            const manifestsFolders = core.getInput('manifests-folders');
            await kubeScore.downloadKubeScore();
            await kubeScore.runKubeScore();
            core.setOutput("score", 90);
            core.setOutput("raw-output", "Just testing");
        }
        catch (error) {
            core.setFailed(error.message);
        }
    }
    return {
        setters: [],
        execute: async function () {
            kubeScore = require('./kubescore');
            core = require('@actions/core');
            github = require('@actions/github');
            await main();
        }
    };
});
