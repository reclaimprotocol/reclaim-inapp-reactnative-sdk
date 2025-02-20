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
import { ReclaimVerificationApi } from '@reclaimprotocol/inapp-rn-sdk';
import Snackbar from 'react-native-snackbar';
import { REACT_APP_RECLAIM_APP_ID, REACT_APP_RECLAIM_APP_SECRET } from '@env';

const config = {
  REACT_APP_RECLAIM_APP_ID: REACT_APP_RECLAIM_APP_ID,
  REACT_APP_RECLAIM_APP_SECRET: REACT_APP_RECLAIM_APP_SECRET,
}
const reclaimVerification = new ReclaimVerification();

export default function App() {
  const [providerId, setProviderId] = useState('6d3f6753-7ee6-49ee-a545-62f1b1822ae5');
  const [result, setResult] = useState<any>(null);
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
      // Advanced Usage: Use ReclaimVerification.setOverrides for overriding sdk
      reclaimVerification.setOverrides({
        provider: {
          jsonString:  await (async () => {
            const response = await fetch(`https://api.reclaimprotocol.org/api/providers/${providerId}`);
            const responseJson =  await response.json();
            return responseJson.providers;
          })()
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
          isResponseRedactionRegexEscapingEnabled: false,
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
      });

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
      if (error instanceof ReclaimVerificationApi.ReclaimVerificationException) {
        switch (error.type) {
          case ReclaimVerificationApi.ExceptionType.Cancelled:
            Snackbar.show({
              text: 'Verification cancelled',
              duration: Snackbar.LENGTH_LONG,
            });
            break;
          case ReclaimVerificationApi.ExceptionType.Dismissed:
            Snackbar.show({
              text: 'Verification dismissed',
              duration: Snackbar.LENGTH_LONG,
            });
            break;
          case ReclaimVerificationApi.ExceptionType.SessionExpired:
            Snackbar.show({
              text: 'Verification session expired',
              duration: Snackbar.LENGTH_LONG,
            });
            break;
          case ReclaimVerificationApi.ExceptionType.Failed:
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
