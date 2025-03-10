# ReclaimVerification Attestor Auth Request

## Basic Usage

The `setVerificationOptions` method allows you to set a callback for providing an auth request to attestor. This is useful when using an attestor that requires auth request in claim.

```typescript
const reclaimVerification = new ReclaimVerification();
// This is how you may be using a different attestor with overrides
await reclaimVerification.setOverrides({
    featureOptions: {
        // overriden attestor browser rpc url
        attestorBrowserRpcUrl: 'https://myattestor.example.org/browser-rpc',
        // other required options (removed for brevity)
    },
});
// Provide a callback to provide attestor auth request.
await reclaimVerification.setVerificationOptions({
    fetchAttestorAuthenticationRequest: async (providerInformationJsonString: string) => {
        // sample attestor auth request
        return JSON.stringify({
            "data": {
                "createdAt": 1741648166,
                "expiresAt": 1741649066,
                "id": "optional-user-id",
                "hostWhitelist": [
                "github.com",
                "example.com"
                ]
            },
            "signature": {
                "type": "uint8array",
                "value": "gSCbBMZSdNJjrxGUTPoERj5S8jtkwQEnGWmmMXx+j3wrd7pspRkfhE96DauFQTVcp+ErB7zWaBDAWwThOu4Fkxw="
            }
        });
    },
});
```

An auth request can be created anywhere, even on your server. JS library `@reclaimprotocol/attestor-core` from npm can be used for creating an auth request. 

```typescript
import { createAuthRequest, B64_JSON_REPLACER } from '@reclaimprotocol/attestor-core'

// this can happen on another server, on the client or anywhere you'd
// like
const authRequest = await createAuthRequest(
    {
        // optional user ID -- to identify the user
        // all logs on the backend will be tagged with thiss
        id: 'optional-user-id',
        // only allow the user to tunnel requests to one of
        // these hosts
        hostWhitelist: ['github.com', 'example.com']
    },
    keyPairs.privateKey
)
const yourAttestorAuthRequest = JSON.stringify(
    authRequest, 
    B64_JSON_REPLACER, 
    2
)
console.info({ yourAttestorAuthRequest });
```
