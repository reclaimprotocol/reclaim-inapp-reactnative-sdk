import { ReclaimVerification } from '@reclaimprotocol/inapp-rn-sdk';
import React, { useState } from 'react';
import { Button, Clipboard, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Snackbar from 'react-native-snackbar';

const config = {
    REACT_APP_RECLAIM_APP_ID: process.env.EXPO_PUBLIC_RECLAIM_APP_ID,
    REACT_APP_RECLAIM_APP_SECRET: process.env.EXPO_PUBLIC_RECLAIM_APP_SECRET,
}

export default function HomeScreen() {
    const [providerId, setProviderId] = useState('example');
    const [verificationUrl, setVerificationUrl] = useState('');
    const [result, setResult] = useState<ReclaimVerification.Response | null>(null);

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
            const reclaimVerification = new ReclaimVerification();
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

    const handleStartVerificationFromUrl = async () => {
        if (!verificationUrl) {
            Snackbar.show({
                text: 'Verification URL is required',
                duration: Snackbar.LENGTH_LONG,
            });
            return;
        }

        try {
            const reclaimVerification = new ReclaimVerification();
            const verificationResult = await reclaimVerification.startVerificationFromUrl(verificationUrl);
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
    }

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
                    Provider ID
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
                    value={providerId}
                    onChangeText={setProviderId}
                    placeholder="Enter provider ID"
                    placeholderTextColor="#999999"
                />
            </View>

            <Button
                title="Start Verification"
                onPress={handleStartVerification}
            />

            <Text style={{ flex: 0, padding: 16, textAlign: 'center', color: '#000000', fontWeight: 'bold' }}>OR</Text>

            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000000' }}>
                    Verification URL
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
                    value={verificationUrl}
                    onChangeText={setVerificationUrl}
                    placeholder="Enter verification URL"
                    placeholderTextColor="#999999"
                />
            </View>

            <Button
                title="Start Verification from URL"
                onPress={handleStartVerificationFromUrl}
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
