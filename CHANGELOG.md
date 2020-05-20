# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 2.0.0 (2020-05-20)


### ⚠ BREAKING CHANGES

* **register component and api:** The register API was updated to include the missing fields.  User validation was
also added to the Register API.
* Update to the login API and jwt middleware
* **patch and retrieve user:** Added three new columns for the User table: firstName, lastName, title

### Features

* **app interceptor:** original request now is sent after refresh ([5072fce](https://github.com/softrams/bulwark/commit/5072fce3a11dd8a8e51cfa46f6adc4d51ed843f3)), closes [#5](https://github.com/softrams/bulwark/issues/5)
* implemented Refresh Token ([21522ac](https://github.com/softrams/bulwark/commit/21522ac7373b310629d80b584687dac3d09a646e)), closes [#5](https://github.com/softrams/bulwark/issues/5)
* **patch and retrieve user:** implemented APIs for user patch and get ([fefd70b](https://github.com/softrams/bulwark/commit/fefd70b64c4fe38136ea3b741cb435aa637c118c)), closes [#4](https://github.com/softrams/bulwark/issues/4)
* **user profile component:** created user profile template ([d2431af](https://github.com/softrams/bulwark/commit/d2431afcbd67f5adc7612ee100997d4d79a48fce)), closes [#4](https://github.com/softrams/bulwark/issues/4)


### Bug Fixes

* **register component and api:** added missing user fields to registeAPI ([6f73ef3](https://github.com/softrams/bulwark/commit/6f73ef34fa8f34f787dfa265a293301d12673dae))


### Docs

* **contributing.md:** modified pull request process ([8f4adce](https://github.com/softrams/bulwark/commit/8f4adce1993d873e77593b9063997a5134be3d59))


### Tests

* **user-profile component:** added unit tests to the user-profile comp ([91ee0c7](https://github.com/softrams/bulwark/commit/91ee0c7173e48af10ba8451000b8b0b456620b4e)), closes [#4](https://github.com/softrams/bulwark/issues/4)


### Code Refactoring

* **login.component:** remove console.log.  Used auth service func ([30eae04](https://github.com/softrams/bulwark/commit/30eae049a9b912de729e13b8a5a93c67baa7bfc3)), closes [#5](https://github.com/softrams/bulwark/issues/5)


### Others

* **angular.json:** turned off google analytics ([1a849c5](https://github.com/softrams/bulwark/commit/1a849c5b0127f01805eb7444aa3668f171281d53))
* **implemented commitizen and husky:** implented commit mgs standards ([16c3e43](https://github.com/softrams/bulwark/commit/16c3e432e20ad7f7c94a5a857631a9d4b12c8cdc))
* **implemented husky, commitizen, and pull request template:** commit ([f14b5b2](https://github.com/softrams/bulwark/commit/f14b5b25ef2dcdc3d07c5fb899ea883cc9b51f65)), closes [#43](https://github.com/softrams/bulwark/issues/43)
* **package.json:** installed standard version ([4390b61](https://github.com/softrams/bulwark/commit/4390b616c3176a77acd98ef2ad9d3d76c900a034)), closes [#42](https://github.com/softrams/bulwark/issues/42)
* **package.json:** updated contributors and set version to 1 ([0910ebe](https://github.com/softrams/bulwark/commit/0910ebe1bd57bf5f3c5cb4b8b3cd066c7d864c3c))
