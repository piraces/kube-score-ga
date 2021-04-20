# kube-score Github Action

![Node.js CI (build, test, lint)](https://github.com/piraces/kube-score-ga/workflows/Node.js%20CI/badge.svg)
![Action CI](https://github.com/piraces/kube-score-ga/workflows/Action%20CI/badge.svg)

This action executes kube-score with selected manifests (with support for YAML, Helm or Kustomize manifests).

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
  uses: piraces/kube-score-ga@v0.1.2
  with:
    manifests-folders: './manifests/*.yml'
```
