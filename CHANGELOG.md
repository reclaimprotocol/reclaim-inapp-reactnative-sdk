## 0.12.0

* Add support to follow links when starting a session with startVerificationFromUrl
* Add support for optional response matches
* Move request matching to platform from webpage injections
* Add regex match support for http provider's requests
* Remove dependency of requestHash to prevent request matching to fail with accidental re-use of request hashes from devtools
* Add retries when loading fonts
* Update cryptography library dependencies
* Add subscribe and mapChangesStream to ObservableNotifier for firing an event on subscribe to prevent listeners from missing latest event
* Add 16kb memory page alignment support for android archive
* Upgrade android agp to 8.7.3
* Update java compatibility to version 11
* Update libgnarkprover compiled binaries with go 1.25
* Update libgnarkprover from github.com/reclaimprotocol/zk-symmetric-crypto revision af4bb82aba064350a96e87b9bfb5fc9777671459
* Fixes edge cases where initialization would get stuck
* Introduce AI flow: enables automated verification for providers with `verificationType` set to `AI`
* AI flow automatically guides users through verification steps and handles data extraction
* Add AI action controller to manage and coordinate AI-driven actions during the verification process
* Add AI flow coordinator widget to manage and coordinate AI flow
* Fix visibility of terms of service
* Add text with hyperlink when an error occurs to help users learn more about potential failures

## 0.10.13

* Add reasons on all android exception cases from verification error responses
* Fix webview re-initialization when initial attempt fails
* Update verification review screen UI
* Add handling of local client errors on attestor browser rpc message
* Fix permissions request dialog on permissions from android webview
* Fix url loading without trying app link from webview
* Add cookie `credentials` field in requests
* Fix verification review UI when oprf is enabled and real value is unavailable

## 0.10.11

* Update activity detection
* Reduce number of browser rpc clients used for value extraction and claim creation
* Lazy initialize browser rpc clients

## 0.10.10

* Update attestor client recovery
* Show a client error screen when no verification activity is detected for some time

## 0.10.9

* Replace old attestor clients before use
* Updates inapp module dependency to 0.10.9

## 0.10.8

* Update Hawkeye script
* Add login detection logging
* Fix unnecessary rebuilds of webview used for value extraction by path
* Updates inapp module dependency to 0.10.8

## 0.10.7

* Update retries during message handling for attestor browser rpc
* Handle android render process gone
* Rebuild browser rpc used for value extraction on receiving no response
* Updates inapp module dependency to 0.10.7

## 0.10.4

* Add a fix to prevent app from launching deeplinks in incognito
* Update readiness test for attestor 
* Fix fonts abrupt visual swap when required fonts are loaded
* Fix UI crash because of missing redaction

## 0.10.3

* Fix param key text overflow verification review
* Add liveliness checks of javascript calls sent to attestor webview
* Updates inapp module dependency to 0.10.3

## 0.10.2

* Add humanized summary of values shown in the verification review UI
* Add async lock around json & xml path evaluations to avoid rpc request deadlock
* Update user login interaction requirement detection
* Fix handling of requests where response selection either doesn't have match or redaction options
* Updates inapp module dependency to 0.10.2

## 0.10.1

* Add missing implementation on ios api from starting verification with json

## 0.10.0

* Bug fixes and performance improvements
* Add retries on timeout when creating claim creation request
* Throw unsupported warning for non 64 bit runtime platforms
* Add device logging id as a fallback device identifier
* Print logs to attached app debugging consoles when logs upload fails 
* Update exceptions cases
* Add check for 4xx errors when throwing ReclaimExpiredSessionException exception
* Fix attestor startup causing requests to get stuck by pre-initializing a separate single browser rpc client for json path and xpath evaluation
* Update copy for manual review, add feature flags for customizing manual review messages and prompt before manual review submission
* Updates inapp module dependency to 0.10.0

## 0.9.4-alpha.4

* Add support for expo android

## 0.9.2

* Fixing issues with incognito (regression)
* Fix manual verification
* Update verification review screen
* Fix hawkeye headers bug with a workaround
* Updates inapp module dependency to 0.9.2

## 0.9.1

* Updates inapp module dependency to 0.9.1

## 0.9.0

* Add resolvedVersion to fetch providers override
* Updates inapp module dependency to 0.9.0

## 0.8.3

* Updates inapp module dependency to 0.8.3
* Add support for versioned providers
* Update [BREAKING] session init handler for overrides
* Updates the UI with a verification review banner in the verification flow
* Remove [BREAKING] `acceptAiProviders`, and `webhookUrl` from ReclaimVerification Request

## 0.7.3

* Fix android verification
* Update android inapp module to 0.7.3

## 0.7.2

* Fix ios build failure caused by swift 6.1's formatting in Api.swift when using swift <6.1

## 0.7.1

* Fix ios build failure caused by a patch in module that broke api

## 0.7.0

* Updates inapp module dependency to 0.7.0

## 0.6.0

* Update claim creation updates UI
* Bug fixes and performance improvements
* Updates inapp module dependency to 0.6.0

## 0.3.1

* Remove exports `ReclaimVerificationApi` & `ReclaimVerificationApiType`. Any usage of `ReclaimVerificationApi`, or `ReclaimVerificationApiType` should be renamed to `ReclaimVerification`.

## 0.3.0

* Add setter for ReclaimVerificationOptions which can be used in ReclaimVerification.

## 0.2.1

* Updated breaking changes in the use of the v0.2.1 of module apis
* Add use of capability access token
* Add callback parameter to fetch provider information from the host app

## 0.1.7

* Replace getDouble with getNumber for better type safety for numbers in android library

## 0.1.6

* Fix null check exception and Double-Long conversion in android plugin code

## 0.1.5

* Updated types to include `ReclaimVerificationResponse` as the type for `ReclaimVerificationApi.Response`.
* Add `types` declaration in package.json.

## 0.1.4

* Example updates.
* Add documentation for overrides.

## 0.1.3

* Documentation updates.
* Changing published packages.

## 0.1.2

* Initial release with verification flow and overrides.
