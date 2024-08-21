import {
  SpeechConfig,
  AudioConfig,
  SpeechSynthesizer,
  ResultReason,
  SpeechSynthesisEventArgs,
  SpeechSynthesisResult,
  SpeechSynthesisVisemeEventArgs,
} from "microsoft-cognitiveservices-speech-sdk";
import { AvatarLoader } from "./AvatarLoader";
import { AbstractMesh } from "@babylonjs/core";
export class TextToSpeech {
  private speechSynthesizer: SpeechSynthesizer;
  private avatar: AbstractMesh;
  private visemeToExpressionMap: { [key: number]: string };
  // Define an array to store viseme data
  public visemeData: { id: number; timing: number }[] = [];

  constructor(subscriptionKey: string, region: string, _avatar: AbstractMesh) {
    const speechConfig = SpeechConfig.fromSubscription(subscriptionKey, region);
    //speechConfig.speechSynthesisVoiceName="en-GB-RyanNeural";
    const audioConfig = AudioConfig.fromDefaultSpeakerOutput();
    this.speechSynthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    this.avatar = _avatar;

    // Inside your class constructor or initialization method
    this.visemeToExpressionMap = {
      0: "viseme_sil",
      1: "viseme_PP",
      2: "viseme_FF",
      3: "viseme_TH",
      4: "viseme_DD",
      5: "viseme_kk",
      6: "viseme_CH",
      7: "viseme_SS",
      8: "viseme_nn",
      9: "viseme_RR",
      10: "viseme_aa",
      11: "viseme_E",
      12: "viseme_I",
      13: "viseme_O",
      14: "viseme_U",
    };

    // Bind the visemeReceived handler to this class
    this.speechSynthesizer.visemeReceived = this.onVisemeReceived.bind(this);
    this.resetMorphTargets();
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

  speakText(
    text: string,
    onSpeakingStarted: () => void,
    onSpeakingEnded: () => void
  ): void {
    // Subscribe to the synthesis started event
    this.speechSynthesizer.synthesisStarted = (
      s: SpeechSynthesizer,
      e: SpeechSynthesisEventArgs
    ) => {
      console.log("Synthesis started.");
    };

    // Subscribe to the synthesis completed event
    this.speechSynthesizer.synthesisCompleted = (
      s: SpeechSynthesizer,
      e: SpeechSynthesisEventArgs
    ) => {
      if (e.result.reason === ResultReason.SynthesizingAudioCompleted) {
        console.log("Synthesis finished and talk animation started");
        onSpeakingStarted();
        this.playAudioAndWait(e.result.audioData, onSpeakingEnded);
        this.synchronizeLipSync();
      } else {
        console.error(
          "Synthesis did not complete successfully: " + e.result.errorDetails
        );
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

  private playAudioAndWait(
    audioData: ArrayBuffer,
    onSpeakingEnded: () => void
  ): void {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    audioContext.decodeAudioData(
      audioData,
      (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        // source.start(0);

        const duration = buffer.duration * 1000; // duration in milliseconds
        console.log(`Audio duration: ${duration} ms`);

        setTimeout(() => {
          onSpeakingEnded();
        }, duration);
      },
      (error) => {
        console.error("Error decoding audio data: ", error);
      }
    );
  }

  private onVisemeReceived(
    s: SpeechSynthesizer,
    e: SpeechSynthesisVisemeEventArgs
  ): void {
    const visemeId = e.visemeId; // ID of the viseme
    const animationTiming = e.audioOffset / 10000; // Timing offset in milliseconds

    // Store viseme data
    this.visemeData.push({
      id: visemeId,
      timing: animationTiming,
    });
    console.log("visemeData ",this.visemeData);
    // const expression = this.visemeToExpressionMap[visemeId];
    // if (expression) {
    //   console.log("expression ", expression);
    //   //this.applyVisemeToAvatar(expression);
    // }
  }

  private applyVisemeToAvatar(visemeId: string): void {
    console.log(visemeId, " and ");
    try {
      const avatarMesh = this.avatar;
      const morphTargetManager = avatarMesh
        .getChildMeshes()
        .map((m) => m.morphTargetManager)
        .filter(Boolean);

      if (!morphTargetManager) {
        throw new Error("MorphTargetManager is not defined on the avatar.");
      }

      // Reset all morph targets before applying the new viseme
      morphTargetManager.forEach((manager, index) => {
        for (let i = 0; i < manager!.numTargets; i++) {
          const target = manager!.getTarget(i);
          if (target) {
            target.influence = 0;
          }
        }
      });
      
      // Find and apply the target viseme based on the viseme ID
      //const visemeName = this.visemeToExpressionMap[visemeId];
      //console.log(`Viseme ID: ${visemeId}, Mapped Expression: ${visemeId}`);

      if (!visemeId) {
        throw new Error(
          `Viseme ID ${visemeId} does not have a corresponding expression.`
        );
      }

      let visemeApplied = false;

      morphTargetManager.forEach((manager, index) => {
        for (let i = 0; i < manager!.numTargets; i++) {
          const target = manager!.getTarget(i);
          if (target && target.name === visemeId) {
            target.influence = 0.6;
            visemeApplied = true;
            console.log(`Applying viseme ${visemeId}  }`);
          }
        }
      });

      if (!visemeApplied) {
        throw new Error(
          `Viseme ${visemeId} not found in the morph target manager.`
        );
      }
    } catch (error) {
      // Log the error using the logger
      console.error("[AvatarComponent][applyVisemeToAvatar] Error:", error);
    }
  }

  public resetMorphTargets(): void {
    const avatarMesh = this.avatar; // Reference to your Babylon.js avatar mesh
    const morphTargetManager = avatarMesh
        .getChildMeshes()
        .map((m) => m.morphTargetManager)
        .filter(Boolean);

        if (!morphTargetManager) {
          throw new Error("MorphTargetManager is not defined on the avatar.");
        }
  
        // Reset all morph targets before applying the new viseme
        morphTargetManager.forEach((manager, index) => {
          for (let i = 0; i < manager!.numTargets; i++) {
            const target = manager!.getTarget(i);
            if (target) {
              target.influence = 0;
            }
          }
        });
  }

  // Function to synchronize lip-sync with stored viseme data
  public synchronizeLipSync() {
    console.log("synchronizeLipSync");
    this.visemeData.forEach(({ id, timing }, index) => {
        console.log("visemeData id ",id,"timing ",timing);
      setTimeout(() => {
        const expression = this.visemeToExpressionMap[id];
        console.log("expression");
        if (expression) {
          this.applyVisemeToAvatar(expression);
        }
      }, timing); // Convert timing from seconds to milliseconds
    });
  }
}
