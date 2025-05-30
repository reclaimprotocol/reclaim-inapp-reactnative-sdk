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
