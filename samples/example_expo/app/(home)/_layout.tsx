import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';
import React, { useState } from 'react';
import { Button, Clipboard, InputModeOptions, KeyboardTypeOptions, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Snackbar from 'react-native-snackbar';

const config = {
    REACT_APP_RECLAIM_APP_ID: process.env.EXPO_PUBLIC_RECLAIM_APP_ID,
    REACT_APP_RECLAIM_APP_SECRET: process.env.EXPO_PUBLIC_RECLAIM_APP_SECRET,
}

type VerificationMode = 'providerId' | 'jsonConfig' | 'url';

export default function HomeScreen() {
    const [verificationMethod, setVerificationMethod] = useState<VerificationMode>('providerId');
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<ReclaimVerification.Response | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const verificationOptions = [
        { label: 'Provider ID', value: 'providerId' },
        { label: 'JSON Config', value: 'jsonConfig' },
        { label: 'URL', value: 'url' },
    ];

    const selectedOption = verificationOptions.find(option => option.value === verificationMethod);

    const getInputLabel = () => {
        switch (verificationMethod) {
            case 'providerId':
                return 'Provider ID';
            case 'jsonConfig':
                return 'JSON Configuration';
            case 'url':
                return 'Verification URL';
        }
    };

    const getInputPlaceholder = () => {
        switch (verificationMethod) {
            case 'providerId':
                return 'Enter provider ID';
            case 'jsonConfig':
                return 'Enter JSON configuration';
            case 'url':
                return 'Enter verification URL';
        }
    };

    const handleStartVerification = async () => {
        if (!inputText) {
            Snackbar.show({
                text: `${getInputLabel()} is required`,
                duration: Snackbar.LENGTH_LONG,
            });
            return;
        }

        try {
            const reclaimVerification = new ReclaimVerification();
            let verificationResult: ReclaimVerification.Response;

            switch (verificationMethod) {
                case 'providerId':
                    console.assert(config.REACT_APP_RECLAIM_APP_ID, 'RECLAIM_APP_ID is not set');
                    console.assert(config.REACT_APP_RECLAIM_APP_SECRET, 'RECLAIM_APP_SECRET is not set');
                    verificationResult = await reclaimVerification.startVerification({
                        appId: config.REACT_APP_RECLAIM_APP_ID ?? '',
                        secret: config.REACT_APP_RECLAIM_APP_SECRET ?? '',
                        providerId: inputText,
                    });
                    break;
                case 'jsonConfig':
                    const jsonConfig = JSON.parse(inputText);
                    verificationResult = await reclaimVerification.startVerificationFromJson(jsonConfig);
                    break;
                case 'url':
                    verificationResult = await reclaimVerification.startVerificationFromUrl(inputText);
                    break;
                default:
                    throw new Error('Invalid verification mode');
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
            const reclaimVerification = new ReclaimVerification();
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#000000' }}>
                Reclaim InApp React Native Expo Example
            </Text>

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

            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000000' }}>
                    {getInputLabel()}
                </Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        borderColor: '#cccccc',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        backgroundColor: '#ffffff',
                    }}
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
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={getInputPlaceholder()}
                    placeholderTextColor="#999999"
                    multiline={verificationMethod === 'jsonConfig'}
                    numberOfLines={verificationMethod === 'jsonConfig' ? 4 : 1}
                />
            </View>

            <Button
                title="Start Verification"
                onPress={handleStartVerification}
            />

            {/* Result Display */}
            <ScrollView style={{
                marginTop: 16,
                flex: 1,
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 4,
                padding: 8,
            }}>
                <Text style={{
                    fontFamily: 'monospace',
                }}  >
                    Results:
                </Text>
                {result && (
                    <Text style={{
                        fontFamily: 'monospace',
                    }} onPress={copyProof} >
                        {JSON.stringify(result, null, 2)}
                    </Text>
                )}
            </ScrollView>

            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Button
                    title="Ping"
                    onPress={onPing}
                />
            </View>


        </SafeAreaView>
    );
}
