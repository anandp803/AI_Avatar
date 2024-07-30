import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

export class SpeechToText {
    private speechRecognizer: SpeechRecognizer;

    constructor(subscriptionKey: string, region: string) {
        const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
        const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
        this.speechRecognizer = new SpeechRecognizer(speechConfig, audioConfig);
    }

    startRecognition(callback: (text: string) => void): void {
        this.speechRecognizer.recognized = (s, e) => {
            if (e.result.reason === ResultReason.RecognizedSpeech) {
                callback(e.result.text);
            }
        };

        this.speechRecognizer.startContinuousRecognitionAsync();
    }

    stopRecognition(): void {
        this.speechRecognizer.stopContinuousRecognitionAsync();
    }
}
