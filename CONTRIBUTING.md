# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Contributing to Development

Issues will be labelled with `help wanted` or `good first issue`

- `Help wanted` label indicates tasks where the project team would appreciate community help
- `Good first issue` label indicates a task that introduce developers to the project, have low complexity, and are isolated

## Version Control

The project uses git as its version control system and GitHub as the central server and collaboration platform.

### Branching model

Softrams Bulwark is maintained in a simplified [Gitflow](https://jeffkreeftmeijer.com/git-flow/) fashion, where all active development happens on the develop branch while master is used to maintain stable versions. Tasks with higher complexity, prototypes, and experiments will occur in feature branches

### Versioning

Any release from master will have a unique version

`MAJOR.MINOR.PATCH` will be incremented by:

1. `MAJOR` version when breaking changes occur
2. `MINOR` version with new functionality that is backwards-compatible
3. `PATCH` version with backwards-compatible bug fixes

## Pull Request Process

1. Ensure any install or build dependencies are removed
2. Increase version numbers [accordingly](#versioning)
3. The code must comply to the configured TSLint and Sass Lint rules
4. Open pull request on the `develop` branch of your fork
5. All Git commits within a PR must be
   [signed off](https://git-scm.com/docs/git-commit#Documentation/git-commit.txt--s)
   to indicate the contributor's agreement with the
   [Developer Certificate of Origin](https://developercertificate.org/).
6. Linting should pass (dependent on project)
7. Tests should pass (dependent on project)

### Linting (Dependent on project)

```
npm run lint
```

### Testing (Dependent on project)

```
npm run test
```

## Code of Conduct

-Insert Softrams Code of Conduct Here-

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

- The use of sexualized language or imagery and unwelcome sexual attention or
  advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or electronic
  address, without explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at [INSERT EMAIL ADDRESS]. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]

[homepage]: http://contributor-covenant.org
[version]: http://contributor-covenant.org/version/1/4/
