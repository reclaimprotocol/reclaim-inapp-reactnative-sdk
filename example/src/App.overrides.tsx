import { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';
import Snackbar from 'react-native-snackbar';
import { REACT_APP_RECLAIM_APP_ID, REACT_APP_RECLAIM_APP_SECRET, REACT_APP_RECLAIM_CAPABILITY_ACCESS_TOKEN } from '@env';

const config = {
  REACT_APP_RECLAIM_APP_ID: REACT_APP_RECLAIM_APP_ID,
  REACT_APP_RECLAIM_APP_SECRET: REACT_APP_RECLAIM_APP_SECRET,
  REACT_APP_RECLAIM_CAPABILITY_ACCESS_TOKEN: REACT_APP_RECLAIM_CAPABILITY_ACCESS_TOKEN,
}
const reclaimVerification = new ReclaimVerification();

export default function App() {
  const [providerId, setProviderId] = useState('6d3f6753-7ee6-49ee-a545-62f1b1822ae5');
  const [result, setResult] = useState<any>(null);
  const setOverrides = async () => {
    try {
      // Advanced Usage: Use ReclaimVerification.setOverrides for overriding sdk
      await reclaimVerification.setOverrides({
        provider: {
          callback: async () => {
            // With a response from an HTTP call
            // const response = await fetch(`https://api.reclaimprotocol.org/api/providers/${providerId}`);
            // const responseJson =  await response.json();
            // return JSON.stringify(responseJson.providers);
            // Or with a constant json string
            return JSON.stringify({
              "id": "669eca16d7e0758c94dfc03f",
              // originally from "6d3f6753-7ee6-49ee-a545-62f1b1822ae5",
              "httpProviderId": providerId,
              "name": "GitHub UserName",
              "description": "Prove your GitHub User Name",
              "logoUrl": "https://devtool-images.s3.ap-south-1.amazonaws.com/http-provider-brand-logos/github.com-11eb32e1-9f3f-4c00-9404-3ed088aa096b.png",
              "url": "https://github.com/settings/profile",
              "urlType": "TEMPLATE",
              "method": "GET",
              "providerType": "PUBLIC",
              "body": null,
              "loginUrl": "https://github.com/settings/profile",
              "isActive": true,
              "responseSelections": [
                {
                  "jsonPath": "",
                  "xPath": "",
                  "responseMatch": "\u003Cspan class=\"color-fg-muted\"\u003E({{username}})\u003C/span\u003E",
                  "matchType": "greedy",
                  "invert": false,
                  "description": "",
                  "hash": ""
                }
              ],
              "creatorUid": "WzFfhAtvUBfgJ372Bvw788nX04y1",
              "applicationId": [],
              "sessionId": [],
              "customInjection": "",
              "bodySniff": {
                "enabled": false,
                "template": ""
              },
              "userAgent": {
                "ios": "",
                "android": "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.6668.69 Mobile Safari/537.36"
              },
              "isApproved": true,
              "geoLocation": "",
              "proofCardText": "Owns data: {{username}}",
              "proofCardTitle": "github.com",
              "matchType": "greedy",
              "sampleIntegration": false,
              "isVerified": true,
              "injectionType": "MSWJS",
              "disableRequestReplay": false,
              "providerHash": "0x7549f801c37c46eb1ca2f5b95214527868a59505a9ed558572508b497a6a69a7",
              "additionalClientOptions": null,
              "verificationType": "WITNESS",
              "expectedPageUrl": "https://github.com",
              "pageTitle": null,
              "stepsToFollow": null,
              "usedInCount": 381,
              "overseerUid": null,
              "overseerNote": null,
              "requestData": [
                {
                  "url": "https://github.com/settings/profile",
                  "expectedPageUrl": null,
                  "urlType": "TEMPLATE",
                  "method": "GET",
                  "responseMatches": [
                    {
                      "value": "\u003Cspan class=\"color-fg-muted\"\u003E({{username}})\u003C/span\u003E",
                      "type": "contains",
                      "invert": false,
                      "description": null
                    }
                  ],
                  "responseRedactions": [
                    {
                      "xPath": "",
                      "jsonPath": "",
                      "regex": "\u003Cspan class=\"color-fg-muted\"\u003E\\((.*)\\)\u003C/span\u003E",
                      "hash": ""
                    }
                  ],
                  "bodySniff": {
                    "enabled": false,
                    "template": ""
                  },
                  "requestHash": "0x7549f801c37c46eb1ca2f5b95214527868a59505a9ed558572508b497a6a69a7"
                }
              ],
              "useIncognitoWebview": false
            });
          },
        },
        logConsumer: {
          canSdkCollectTelemetry: false,
          canSdkPrintLogs: false,
          onLogs: (logJsonString, _) => {
            console.log({ "reclaim.logs": logJsonString });
          },
        },
        appInfo: {
          appName: "Overriden Example",
          appImageUrl: "https://placehold.co/400x400/png"
        },
        featureOptions: {
          cookiePersist: null,
          singleReclaimRequest: false,
          idleTimeThresholdForManualVerificationTrigger: 2,
          sessionTimeoutForManualVerificationTrigger: 180,
          attestorBrowserRpcUrl: 'https://attestor.reclaimprotocol.org/browser-rpc',
          isAIFlowEnabled: false,
        },
        sessionManagement: {
          onLog: (event) => {
            console.log({ "reclaim.session.log": event });
          },
          onSessionCreateRequest: async (event) => {
            console.log({ "reclaim.session.createRequest": event });
            return true;
          },
          onSessionUpdateRequest: async (event) => {
            console.log({ "reclaim.session.updateRequest": event });
            return true;
          },
        },
        capabilityAccessToken: config.REACT_APP_RECLAIM_CAPABILITY_ACCESS_TOKEN,
      });
      console.info('Overrides set');
    } catch (error: any) {
      console.error({
        reason: 'reason' in error ? error.reason : 'no details',
        error,
      });
    }
  }
  const clearAllOverrides = async () => {
    try {
      await reclaimVerification.clearAllOverrides();
      console.info('All overrides cleared');
    } catch (error) {
      console.error(error);
    }
  }
  const handleStartVerification = async () => {
    if (!providerId) {
      Snackbar.show({
        text: 'Provider ID is required',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }
    console.assert(config.REACT_APP_RECLAIM_APP_ID, 'RECLAIM_APP_ID is not set');
    console.assert(config.REACT_APP_RECLAIM_APP_SECRET, 'RECLAIM_APP_SECRET is not set');
    try {
      const verificationResult = await reclaimVerification.startVerification({
        appId: config.REACT_APP_RECLAIM_APP_ID ?? '',
        secret: config.REACT_APP_RECLAIM_APP_SECRET ?? '',
        providerId: providerId,
      });
      setResult(verificationResult);
    } catch (error) {
      console.info({
        verificationError: error,
      });
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
  };

  const onPing = async () => {
    try {
      const result = await reclaimVerification.ping();
      if (result) {
        Snackbar.show({
          text: 'Received ping',
          duration: Snackbar.LENGTH_LONG,
        });
      }
    } catch (error) {
      console.error(error);
      Snackbar.show({
        text: error instanceof Error ? error.message : 'Ping failed',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />

      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>
          Reclaim React Native InApp SDK Example
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={providerId}
          onChangeText={setProviderId}
          placeholder="Enter Provider ID"
          placeholderTextColor="#666"
        />

        <Button
          title="Set Overrides"
          onPress={setOverrides}
        />

        <Button
          title="Clear All Overrides"
          onPress={clearAllOverrides}
        />

        <Button
          title="Start Verification"
          onPress={handleStartVerification}
        />

        <Button
          title="Ping"
          onPress={onPing}
        />

        {/* Result Display */}
        <ScrollView style={styles.resultContainer}>
          {result && (
            <Text style={styles.resultText}>
              {JSON.stringify(result, null, 2)}
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    backgroundColor: '#2196F3',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  resultContainer: {
    marginTop: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  resultText: {
    fontFamily: 'monospace',
  },
});
