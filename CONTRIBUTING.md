# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue with the owners of this repository before making a change.

## Contributing to Development

Issues will be labelled with `help wanted` or `good first issue`

- `Help wanted` label indicates tasks where the project team would appreciate community help
- `Good first issue` label indicates a task that introduce developers to the project, have low complexity, and are isolated

## Version Control

The project uses git as its version control system and GitHub as the central server and collaboration platform.

### Branching model

Bulwark is maintained in a simplified [Gitflow](https://jeffkreeftmeijer.com/git-flow/) fashion, where all active development happens on the develop branch while master is used to maintain stable versions. Tasks with higher complexity, prototypes, and experiments will occur in feature branches

### Versioning

Any release from master will have a unique version

`MAJOR.MINOR.PATCH` will be incremented by:

1. `MAJOR` version when breaking changes occur
2. `MINOR` version with new functionality that is backwards-compatible
3. `PATCH` version with backwards-compatible bug fixes

## Pull Request Process

1. All work must be done in a fork off the dev branch
2. Ensure any install or build dependencies are removed
3. All Git commits within a PR must be conventional commits using [commitizen](https://github.com/commitizen/cz-cli) and enforced by [husky](https://github.com/typicode/husky)
   1. Run `$ git cz` when committing changes
4. Increase version numbers [accordingly](#versioning)
5. The code must comply to the configured TSLint and Sass Lint rules
6. Open pull request on the `develop` branch of your fork

### Linting

```
npm run lint
```
