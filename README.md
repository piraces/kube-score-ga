# kube-score Github Action

![Node.js CI (build, test, lint)](https://github.com/piraces/kube-score-ga/workflows/Node.js%20CI/badge.svg)
![Action CI](https://github.com/piraces/kube-score-ga/workflows/Action%20CI/badge.svg)

This action executes [kube-score](https://kube-score.com/) with selected manifests (with support for YAML, Helm or Kustomize manifests).

## Features

💻 Compatible with Windows, Linux and Darwin Operating Systems.

🏗 Supported architectures: ARMv6, ARM64, x64.

📂 Multiple folders and files supported within one run of the action (with wildcards support).

📤 Export all analysis results to an output file.

🔢 All versions of kube-score can be selected and used.

⚡ Support for caching kube-score tool to improve speed in subsequent runs.

## Inputs

### `kube-score-version`

*(Optional)*: The version of kube-score to use. Defaults to the latest available.

### `manifests-folders`

**Required**: An array of relative paths containing manifests to analyze with kube-score (separated with commas). It is mandatory to establish a wildcard for the files or the concrete filename.

Example: `./manifests/*.yml,./other/manifests/*.yml`

### `ignore-exit-code`

*(Optional)*: Will ignore the exit code provided by `kube-score`, will always pass the check. This could be useful in case of using the action in an information way.

### `output-file`

*(Optional)*: Generate an output file with the results of `kube-score` analysis for each manifest file (instead of printing in the standard output).
Each analysis is separated by a text block.

## Outputs

This action does not contain outputs. Only if `output-file` is provided, then a file will be generated but no handled as an output.

## Example usage
**Note**: it is necessary to perform a checkout of the repository before running the action.
```
- name: Checkout
  uses: actions/checkout@v2
- name: kube-score check
  uses: piraces/kube-score-ga@v0.1.3
  with:
    manifests-folders: './manifests/*.yml'
```

## Usage with Helm or Kustomize
[![Action CI (Helm)](https://github.com/piraces/kube-score-ga/actions/workflows/test-action-helm.yml/badge.svg)](https://github.com/piraces/kube-score-ga/actions/workflows/test-action-helm.yml)

[![Action CI (Kustomize)](https://github.com/piraces/kube-score-ga/actions/workflows/test-action-kustomize.yml/badge.svg)](https://github.com/piraces/kube-score-ga/actions/workflows/test-action-kustomize.yml)

**This action and kube-score itself can work with the output of [helm](https://helm.sh/) and [kustomize](https://kustomize.io/)**, some examples are provided in the workflows `.github/workflows/test-action-helm.yml` and `.github/workflows/test-action-kustomize.yml` which runs can be seen clicking in the badges above.

**It is important to note that kube-score only parses static `yaml`**. Nevertheless, since `helm` and `kustomize` produce them, we can use the tool to scan them.

### Helm

In the case for Helm, we can previously build the desired template, redirect the output to a file and then executing the action. For example:

```
- name: Checkout
  uses: actions/checkout@v2
- uses: azure/setup-helm@v3
  name: Setup Helm
  with:
    token: ${{ secrets.GITHUB_TOKEN }} # only needed if version is 'latest'
  id: install
- name: Make temporal output directory
  run: mkdir -p out/helm
- name: Helm Template to standard template
  run: helm template .\sample-manifests\helm\example-chart > ./out/helm/sample-helm.yaml
- name: kube-score check
  uses: piraces/kube-score-ga@v0.1.3
  with:
    manifests-folders: './out/helm/*.yml'
```

In this case we are doing the same behaviour of the following command:
```bash
helm template .\sample-manifests\helm\example-chart | kube-score score -
```

# Kustomize

The case for Kustomize is mostly the same as Helm, we can previously build the desired template, redirect the output to a file and then executing the action. For example:

```
- name: Checkout
  uses: actions/checkout@v2
- uses: azure/setup-kubectl@v3
  id: install
- name: Make temporal output directory
  run: mkdir -p out/kustomize
- name: kustomize build to standard template
  run: kubectl kustomize sample-manifests/kustomize/overlays/production > ./out/kustomize/sample-kustomize.yaml
- name: kube-score check
  uses: piraces/kube-score-ga@v0.1.3
  with:
    manifests-folders: './out/kustomize/*.yml'
```

In this case we are doing the same behaviour of the following command:
```bash
kustomize build sample-manifests/kustomize/overlays/production | kube-score score -
```

Or with `kubectl`:
```bash
kubectl kustomize sample-manifests/kustomize/overlays/production | kube-score score -
```