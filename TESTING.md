# Testing Requirements

1. All new and updated **back-end** code should have a corresponding unit tests
2. All new and existing unit tests should pass locally before opening a Pull-Request
3. Linting should pass locally before opening a Pull-Request

## Running Front-End Unit Tests (Not Currently Required)

- The Angular unit tests have **not** been implemented so please skip this section
- Run `npm run test:front` to execute the unit tests via [Karma](https://karma-runner.github.io)
- Follow the recommended guidelines for Front-End [Testing](https://angular.io/guide/testing)

## Running Back-End Unit Tests

- Run `npm run test:node` to execute the unit tests via [Jest](https://jestjs.io/)
- Test coverage report can be opened in browser located in: `coverage/lcov-report/index.html`
- Follow the recommended guidelines for Back-End [Testing](https://jestjs.io/)

## Running All Tests

- Run `npm run test` to execute the unit tests.

## Linting

```
npm run lint
```

In case your PR is failing from style guide issues try running `npm run lint:fix` - this will fix all syntax or code style issues automatically without breaking your code.

### Prettier

Bulwark uses [Prettier](https://prettier.io/) for opinionating code formatting. It is recommended to run it from your editor. Use the following [steps](https://prettier.io/docs/en/editors.html) to integrate Prettier into your editor.
