# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.1.3](https://github.com/softrams/bulwark/compare/v3.1.2...v3.1.3) (2020-07-10)


### Others

* **fix dependabot config:** fix dependabot config errors ([f4acc17](https://github.com/softrams/bulwark/commit/f4acc17bb797a16214f761239391477795d5ba9d))

### [3.1.2](https://github.com/softrams/bulwark/compare/v3.1.1...v3.1.2) (2020-07-10)


### Others

* **add target branch:** add target branch to dependabot ([8a5732b](https://github.com/softrams/bulwark/commit/8a5732bceb32b6ee44f4b83837112090643b5a59))

### [3.1.1](https://github.com/softrams/bulwark/compare/v3.1.0...v3.1.1) (2020-07-10)


### Others

* **add dependabot config:** add dependabot configuration ([bcf46b1](https://github.com/softrams/bulwark/commit/bcf46b146b2240c4d7269caf3df2ee413771d431)), closes [#65](https://github.com/softrams/bulwark/issues/65)

## [3.1.0](https://github.com/softrams/bulwark/compare/v3.0.2...v3.1.0) (2020-07-09)


### Features

* **user-profile component:** ability to update user password ([9855987](https://github.com/softrams/bulwark/commit/985598765c7e7a4002bc5dd679a2096a1833dbc6)), closes [#50](https://github.com/softrams/bulwark/issues/50)
* **user-profile.component.ts:** wired API to auth service and user prof ([6b6eb36](https://github.com/softrams/bulwark/commit/6b6eb36b1a361d2c3601e6cb7d4bac24a80b5c0c)), closes [#50](https://github.com/softrams/bulwark/issues/50)


### Bug Fixes

* **babel.config.js:** added new line ([e0617dd](https://github.com/softrams/bulwark/commit/e0617dd8e0d7c5c3b71ec88cc903e22632f5c418))
* **jest.config.js:** removed tsx and jsx ([a269233](https://github.com/softrams/bulwark/commit/a26923324c0fbff7a32617fb5cc9298ef53df816))
* **jwt.spec.ts:** added comments ([3b1505b](https://github.com/softrams/bulwark/commit/3b1505bbe7a449a32188f97f1fdbee4f6f1de63e))
* **jwt.spec.ts:** added process.env to beforeAll to fix the issue ([51ab6e8](https://github.com/softrams/bulwark/commit/51ab6e805df007f3dbc41c9864670b2716ed9afd))
* **jwt.spec.ts:** readded dotenv.config per PR ([e6ff159](https://github.com/softrams/bulwark/commit/e6ff1590f177c0460976360682e84935a8cc848b))
* **jwt.spec.ts:** removed need for process.env ([c8ab992](https://github.com/softrams/bulwark/commit/c8ab99274859d9287ff21f9e82416dd2ef1d73db))
* **package.json:** added needed packages to package.json ([15708b7](https://github.com/softrams/bulwark/commit/15708b7a19eed9a65be054876e4b231d2cee02ca))
* **testing.md:** fixed a typo issue ([5441e7b](https://github.com/softrams/bulwark/commit/5441e7b43bba629bff0eaef374355e2f45163938))
* **tsconfig.json:** added spec.ts to the exclude list ([66321e1](https://github.com/softrams/bulwark/commit/66321e1284adc186fdc645a4cdc65f6b74b992f5))


### Code Refactoring

* **user-profile.component.html .spec.ts:** updated element ID ([e91f40c](https://github.com/softrams/bulwark/commit/e91f40c820bd340f0b8f8f1472be7ecf737ba342)), closes [#50](https://github.com/softrams/bulwark/issues/50)


### Docs

* **contributing.md:** added a testing section under the linting section ([332e174](https://github.com/softrams/bulwark/commit/332e174f34a3b1bb996c7af567478b9a33dcfe9f))
* **contributing.md:** removed testing information and added testing.md ([f3bdc44](https://github.com/softrams/bulwark/commit/f3bdc443cea498a8ce1fcf6f6687475b2c4c3c61))
* **testing.md:** added a line to open the test coverage ([95d4862](https://github.com/softrams/bulwark/commit/95d48623d0a929bc667b92e0ee6b93484bdb1b54))
* **testing.md:** removed comment of early stages ([f4ccdb9](https://github.com/softrams/bulwark/commit/f4ccdb92c1ac9dfe30f9a8241f15f7162c058a3e))
* **testings.md:** added testing doc to run down requirements ([4dc0672](https://github.com/softrams/bulwark/commit/4dc0672e7cd267201ff3126a9363b8758e3fe037))

### [3.0.2](https://github.com/softrams/bulwark/compare/v3.0.1...v3.0.2) (2020-05-28)


### Docs

* **seed-user.ts:** updated documentation ([1797f44](https://github.com/softrams/bulwark/commit/1797f4412cd1cfca0c8fa3ce54709a9aa81b8d34))

### [3.0.1](https://github.com/softrams/bulwark/compare/v3.0.0...v3.0.1) (2020-05-28)


### Bug Fixes

* **seed-user.ts:** update seed user with new fields ([a7881b8](https://github.com/softrams/bulwark/commit/a7881b80d2baf4a017d1cb70661002dce65f20b8)), closes [#57](https://github.com/softrams/bulwark/issues/57)

## [3.0.0](https://github.com/softrams/bulwark/compare/v2.0.1...v3.0.0) (2020-05-28)


### ⚠ BREAKING CHANGES

* **assessment form and report:** ManyToMany relationship has been created between the User and Assessment models.
API's have been updated for this change.  New API's created to retrieve users.

### Features

* **assessment form and report:** dynamic tester association to asssment ([3bbfc9c](https://github.com/softrams/bulwark/commit/3bbfc9c4d3d3a8f801ef3691298de223cea10dcc)), closes [#52](https://github.com/softrams/bulwark/issues/52)


### Bug Fixes

* **angular datepipe:** added UTC property to datepipe ([701611f](https://github.com/softrams/bulwark/commit/701611f94970502b327bd29f22cd99c090892359)), closes [#3](https://github.com/softrams/bulwark/issues/3)


### Code Refactoring

* **assessment controller:** updated response message. Removed usrId ([c2d2555](https://github.com/softrams/bulwark/commit/c2d2555e48aa86be0e13f1778297d1cdb73efb75)), closes [#52](https://github.com/softrams/bulwark/issues/52)

### [2.0.1](https://github.com/softrams/bulwark/compare/v2.0.0...v2.0.1) (2020-05-20)


### Docs

* **readme.md:** added new env var and fixed typo ([5ccf6ac](https://github.com/softrams/bulwark/commit/5ccf6ac022ee1012141b2518848443de04b5f19c))

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
