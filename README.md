# Reclaim InApp React Native SDK

## @reclaimprotocol/inapp-rn-sdk

[![Reclaim React Native SDK](https://img.shields.io/github/v/tag/reclaimprotocol/reclaim-inapp-reactnative-sdk.svg)](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk)
[![Documentation](https://img.shields.io/badge/read_the-docs-blue.svg)](https://docs.reclaimprotocol.org/inapp-sdks/react-native)
[![NPM Version](https://img.shields.io/npm/v/%40reclaimprotocol%2Finapp-rn-sdk.svg)](https://www.npmjs.com/package/@reclaimprotocol/inapp-rn-sdk)

This SDK allows you to integrate Reclaim's in-app verification process into your React Native application.

[Refer Reclaim Protocol's official documentation for React Native SDK](https://docs.reclaimprotocol.org/inapp-sdks/react-native)

## Prerequisites

- A [Reclaim account](https://dev.reclaimprotocol.org/explore) where you've created an app and have the app id, app secret.
- A provider id that you've added to your app in [Reclaim Devtools](https://dev.reclaimprotocol.org/explore).

## Example

- See the [Reclaim Example - React Native](samples/example_new_arch/README.md) for a complete example of how to use the SDK in a React Native application.
- See the [Reclaim Example - React Native Expo](samples/example_expo/README.md) for a complete example of how to use the SDK in a React Native Expo application.

## Installation

Choose the appropriate installation guide based on your project setup:

**For React Native projects without Expo:**
📖 [Installation Guide for React Native (No Framework)](documentation/install-no-framework.md)

**For React Native Expo projects:**
📖 [Installation Guide for React Native Expo](documentation/install-expo.md)

## Usage

To use Reclaim InApp Sdk in your project, follow these steps:

1. Import the `@reclaimprotocol/inapp-rn-sdk` package in your project file.

```js
import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';
```

2. Initialize the `ReclaimVerification` class to create an instance.

```js
const reclaimVerification = new ReclaimVerification();
```

3. Start the verification flow by providing the app id, secret and provider id.

```js
const verificationResult = await reclaimVerification.startVerification({
    appId: config.REACT_APP_RECLAIM_APP_ID ?? '',
    secret: config.REACT_APP_RECLAIM_APP_SECRET ?? '',
    providerId: providerId,
});
```

The returned result is a [ReclaimVerification.Response] object. This object contains a response that has proofs, exception, and the sessionId if the verification is successful.

### Exception Handling

If the verification ends with an exception, the exception is thrown as a [ReclaimVerification.ReclaimVerificationException] object.

Following is an example of how to handle the exception using [error.type]:

```js
try {
  // ... start verification
} catch (error) {
  if (error instanceof ReclaimVerification.ReclaimVerificationException) {
    switch (error.type) {
      case ReclaimVerification.ExceptionType.Cancelled:
        Snackbar.show({
          text: 'Verification cancelled',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerification.ExceptionType.Dismissed:
        Snackbar.show({
          text: 'Verification dismissed',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerification.ExceptionType.SessionExpired:
        Snackbar.show({
          text: 'Verification session expired',
          duration: Snackbar.LENGTH_LONG,
        });
        break;
      case ReclaimVerification.ExceptionType.Failed:
      default:
        Snackbar.show({
          text: 'Verification failed',
          duration: Snackbar.LENGTH_LONG,
        });
    }
  } else {
    Snackbar.show({
      text: error instanceof Error ? error.message : 'An unknown verification error occurred',
      duration: Snackbar.LENGTH_LONG,
    });
  }
}
```

This error also contains `sessionId`, `reason`, and `innerError` that can be used to get more details about the occurred error.

```js
error.sessionId
error.reason
error.innerError
```

## Troubleshooting

### Build failures for iOS in 0.7.x

- An accidental breaking change may cause 0.7.0, 0.7.1, 0.7.2 to fail with build failures for Android and iOS. Update 0.7.3 fixes this issue.

## Migration

- Migration steps for [0.9.2](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#092)
- Migration steps for [0.9.1](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#091)
- Migration steps for [0.9.0](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#090)
- Migration steps for [0.8.3](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#083)
- Migration steps for [0.7.3](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#073)
- Migration steps for [0.6.0](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#060)
- Migration steps for [0.3.1](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#031)
- Migration steps for [0.3.0](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#030)
- Migration steps for [0.2.1](https://github.com/reclaimprotocol/reclaim-inapp-reactnative-sdk/blob/main/documentation/migration.md#021)

## Advanced Usage

### Overriding SDK Config

```js
// Advanced Usage: Use ReclaimVerification.setOverrides for overriding sdk
reclaimVerification.setOverrides({
  appInfo: {
    appName: "Overriden Example",
    appImageUrl: "https://placehold.co/400x400/png"
  }
  // .. other overrides
})
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
