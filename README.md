# kube-score Github Action

**(WIP)**
This action executes kube-score with selected manifests (with support for YAML, Helm or Kustomize).

## Inputs

### `kube-score-version`

*(Optional)* The version of kube-score to use. Defaults to the latest available.

### `manifests-folders`

**Required** An array of relative paths containing manifests to analyze with kube-score (separated with commas). It is mandatory to establish a wildcard for the files or the concrete filename.

Example: `./manifests/*.yml, ./other/manifests/*.yml`

## Outputs

### `score`

Score of your manifests from kube-score.

### `raw-output`

Raw output from running kube-score with your manifests.

## Example usage
```
uses: piraces/kube-score-ga@v1
with:
  manifests-folders: './manifests/*.yml'
```
