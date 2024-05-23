import * as core from '@actions/core';
import { downloadKubeScore, runKubeScore } from './kubescore';

async function main() {
    try {
        const kubeScoreVersion = core.getInput('kube-score-version');
        core.info(`Selected kube-score ${kubeScoreVersion || 'latest'} version!`);
        const manifestsFolders = core.getInput('manifests-folders');
        const outputFile = core.getInput('output-file');
        const outputFormat = core.getInput('output-format');

        if (!manifestsFolders) {
            core.setFailed('[FATAL] Input for manifests-folders is mandatory');
        }

        const foldersArray = manifestsFolders.split(',');

        await downloadKubeScore(kubeScoreVersion || undefined);
        await runKubeScore(foldersArray, outputFile, outputFormat);
    } catch (error) {
        core.setFailed(error as Error);
    }
}

main();
