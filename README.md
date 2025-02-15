# @reclaimprotocol/inapp-rn-sdk

Reclaim Protocol's InApp React Native SDK for ZK proof generations for requests with an in-app experience of web verification

## Installation

```sh
npm install @reclaimprotocol/inapp-rn-sdk
```

## Usage

### Initialize

```js
import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';

// ...

const reclaimVerification = new ReclaimVerification();
```

### Start verification

```js
const verificationResult = await reclaimVerification.startVerification({
    appId: config.REACT_APP_RECLAIM_APP_ID ?? '',
    secret: config.REACT_APP_RECLAIM_APP_SECRET ?? '',
    providerId: providerId,
});
```

## Advanced Usage

### Overriding SDK Config

```js
// Advanced Usage: Use ReclaimVerification.setOverrides for overriding sdk
reclaimVerification.setOverrides({
  appInfo: {
    appName: "Overriden Example",
    appImageUrl: "https://placehold.co/400x400/png"
  }
})
```

Note: Overriding again will clear previous overrides

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
