import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisEventArgs, SpeechSynthesisResult } from 'microsoft-cognitiveservices-speech-sdk';

export class TextToSpeech {
    private speechSynthesizer: SpeechSynthesizer;

    constructor(subscriptionKey: string, region: string) {
        const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
        const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
        this.speechSynthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    }

    // speakText(text: string): void {
    //     this.speechSynthesizer.speakTextAsync(text, result => {
    //         if (result.reason === ResultReason.SynthesizingAudioCompleted) {
    //             console.log("Synthesis finished.");
    //         } else {
    //             console.error("Error synthesizing speech: " + result.errorDetails);
    //         }
    //     }, error => {
    //         console.error(error);
    //     });
    // }

    speakText(text: string, onSpeakingStarted: () => void, onSpeakingEnded: () => void): void {
        // Subscribe to the synthesis started event
        this.speechSynthesizer.synthesisStarted = (s: SpeechSynthesizer, e: SpeechSynthesisEventArgs) => {
            console.log("Synthesis started.");            
        };

        // Subscribe to the synthesis completed event
        this.speechSynthesizer.synthesisCompleted = (s: SpeechSynthesizer, e: SpeechSynthesisEventArgs) => {
            if (e.result.reason === ResultReason.SynthesizingAudioCompleted) {
                console.log("Synthesis finished and talk animation started");
                onSpeakingStarted();
                this.playAudioAndWait(e.result.audioData, onSpeakingEnded);
            } else {
                console.error("Synthesis did not complete successfully: " + e.result.errorDetails);
            }
        };

        // Start speaking text asynchronously
        this.speechSynthesizer.speakTextAsync(
            text,
            (result: SpeechSynthesisResult) => {
                if (result.reason !== ResultReason.SynthesizingAudioCompleted) {
                    console.error("Error synthesizing speech: " + result.errorDetails);
                }
            },
            (error) => {
                console.error(error);
            }
        );
    }

    private playAudioAndWait(audioData: ArrayBuffer, onSpeakingEnded: () => void): void {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.decodeAudioData(audioData, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
           // source.start(0);

            const duration = buffer.duration * 1000; // duration in milliseconds
            console.log(`Audio duration: ${duration} ms`);

            setTimeout(() => {
                onSpeakingEnded();
            }, duration);

        }, (error) => {
            console.error("Error decoding audio data: ", error);
        });
    }
}
