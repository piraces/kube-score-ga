import core = require('@actions/core');
import kubeScore = require('./kubescore');

async function main() {
    try {
        const kubeScoreVersion = core.getInput('kube-score-version');
        core.info(`Selected kube-score ${kubeScoreVersion || 'latest'} version!`);
        const manifestsFolders = core.getInput('manifests-folders');

        if (!manifestsFolders) {
            core.setFailed('[FATAL] Input for manifests-folders is mandatory');
        }

        const foldersArray = manifestsFolders.split(',');

        await kubeScore.downloadKubeScore(kubeScoreVersion || undefined);
        await kubeScore.runKubeScore(foldersArray);
    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
