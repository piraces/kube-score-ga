const kubeScore = require('./kubescore');
const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
  try {
    const kubeScoreVersion = core.getInput('kube-score-version');
    console.log(`Selected kube-score version ${kubeScoreVersion}!`);
    const manifestsFolders = core.getInput('manifests-folders');

    await kubeScore.downloadKubeScore();
    await kubeScore.runKubeScore();

    core.setOutput("score", 90);
    core.setOutput("raw-output", "Just testing");
  } catch (error) {
    core.setFailed(error.message);
  }
}

await main()
export { };
