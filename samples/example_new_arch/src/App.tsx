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
  Clipboard,
  Pressable,
  Modal,
  TouchableOpacity,
  KeyboardTypeOptions,
  InputModeOptions,
} from 'react-native';
import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';
import Snackbar from 'react-native-snackbar';
import { REACT_APP_RECLAIM_APP_ID, REACT_APP_RECLAIM_APP_SECRET } from '@env';
import React from 'react';

const config = {
  REACT_APP_RECLAIM_APP_ID: REACT_APP_RECLAIM_APP_ID,
  REACT_APP_RECLAIM_APP_SECRET: REACT_APP_RECLAIM_APP_SECRET,
}
const reclaimVerification = new ReclaimVerification();

type VerificationMode = 'providerId' | 'jsonConfig' | 'url';

export default function App() {
  const [verificationMethod, setVerificationMethod] = useState<VerificationMode>('providerId');
  const [inputText, setInputText] = useState('6d3f6753-7ee6-49ee-a545-62f1b1822ae5');
  const [result, setResult] = useState<ReclaimVerification.Response | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const verificationOptions = [
    { label: 'Provider ID', value: 'providerId' },
    { label: 'JSON Config', value: 'jsonConfig' },
    { label: 'URL', value: 'url' },
  ];

  const selectedOption = verificationOptions.find(option => option.value === verificationMethod);

  const getInputPlaceholder = () => {
    switch (verificationMethod) {
      case 'providerId':
        return 'Enter Provider ID';
      case 'jsonConfig':
        return 'Enter JSON Configuration';
      case 'url':
        return 'Enter Verification URL';
    }
  };

  const handleStartVerification = async () => {
    if (!inputText) {
      Snackbar.show({
        text: 'Input is required',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }

    switch (verificationMethod) {
      case 'providerId':
        console.assert(config.REACT_APP_RECLAIM_APP_ID, 'RECLAIM_APP_ID is not set');
        console.assert(config.REACT_APP_RECLAIM_APP_SECRET, 'RECLAIM_APP_SECRET is not set');
        break;
      case 'jsonConfig':
        break;
      case 'url':
        break;
    }
    try {
      let verificationResult: ReclaimVerification.Response;
      switch (verificationMethod) {
        case 'providerId':
          verificationResult = await reclaimVerification.startVerification({
            appId: config.REACT_APP_RECLAIM_APP_ID ?? '',
            secret: config.REACT_APP_RECLAIM_APP_SECRET ?? '',
            providerId: inputText,
          });
          break;
        case 'jsonConfig':
          verificationResult = await reclaimVerification.startVerificationFromJson(JSON.parse(inputText));
          break;
        case 'url':
          verificationResult = await reclaimVerification.startVerificationFromUrl(inputText);
          break;
      }
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

  const copyProof = async () => {
    if (!result) {
      Snackbar.show({
        text: 'No proof to copy',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }
    try {
      Clipboard.setString(JSON.stringify(result));
      Snackbar.show({
        text: 'Proof copied to clipboard',
        duration: Snackbar.LENGTH_LONG,
      });
    } catch (error) {
      Snackbar.show({
        text: error instanceof Error ? error.message : 'Failed to copy proof',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  }

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
        {/* Verification Method Dropdown */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000000' }}>
            Verification Mode
          </Text>
          <Pressable
            onPress={() => setShowDropdown(true)}
            style={{
              borderWidth: 1,
              borderColor: '#cccccc',
              borderRadius: 8,
              backgroundColor: '#ffffff',
              padding: 15,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: '#000000' }}>
              {selectedOption?.label || 'Select verification mode'}
            </Text>
            <Text style={{ fontSize: 16, color: '#666666' }}>▼</Text>
          </Pressable>

          <Modal
            visible={showDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDropdown(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={1}
              onPress={() => setShowDropdown(false)}
            >
              <View
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 20,
                  width: '80%',
                  maxWidth: 300,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
                  Select Verification Mode
                </Text>
                {verificationOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0',
                      backgroundColor: verificationMethod === option.value ? '#f0f8ff' : 'transparent',
                    }}
                    onPress={() => {
                      setVerificationMethod(option.value as VerificationMode);
                      setInputText('');
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: verificationMethod === option.value ? '#007AFF' : '#000000',
                        fontWeight: verificationMethod === option.value ? '600' : '400',
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                  }}
                  onPress={() => setShowDropdown(false)}
                >
                  <Text style={{ fontSize: 16, color: '#666666' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <TextInput
          style={[styles.input, verificationMethod === 'jsonConfig' && styles.jsonInput]}
          value={inputText}
          onChangeText={setInputText}
          inputMode={((): InputModeOptions => {
            switch (verificationMethod) {
              case 'providerId':
              case 'jsonConfig':
                return 'text';
              case 'url':
                return 'url';
            }
          })()}
          keyboardType={((): KeyboardTypeOptions => {
            switch (verificationMethod) {
              case 'providerId':
              case 'jsonConfig':
                return 'default';
              case 'url':
                return 'url';
            }
          })()}
          autoCapitalize={'none'}
          placeholder={getInputPlaceholder()}
          placeholderTextColor="#666"
          multiline={verificationMethod === 'jsonConfig'}
          numberOfLines={verificationMethod === 'jsonConfig' ? 4 : 1}
        />

        <Button
          title="Start Verification"
          onPress={handleStartVerification}
        />

        <Text style={styles.button} ></Text>

        <Button
          title="Ping"
          onPress={onPing}
        />

        {/* Result Display */}
        <ScrollView style={styles.resultContainer}>
          {result && (
            <Text style={styles.resultText} onPress={copyProof} >
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
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  orLabel: {
    flex: 0,
    padding: 6,
  },
  button: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  jsonInput: {
    height: 100,
    textAlignVertical: 'top',
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
