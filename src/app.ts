import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  RichType,
  FreeCamera,
  Color4,
  Color3,
} from "@babylonjs/core";
import { AvatarLoader } from "./AvatarLoader"; // Import the AvatarLoader class
import { App_GUI } from "./App_GUI";
import { SpeechToText } from "./speechtotext";
import { TextToSpeech } from "./texttospeech";
import { CustomerService } from "./questionAnswer";
import { ChatUI } from "./ChatUI";

export class App {
  private avatarLoader: AvatarLoader;
  private App_Gui: App_GUI;
  private adjustedAvatarPositionforCam;
  private stt: SpeechToText;
  private tts: TextToSpeech;
  private chatUI: ChatUI;
  private isRecording: boolean = false;

  // Your Azure subscription key and region
  private subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;//"e8e1f4c5964c47e5920d979cb4306902";
  private serviceRegion = process.env.AZURE_REGION;//"eastasia";
  private questionAnswer: CustomerService;

  constructor() {
    this.initializeScene()
      .then(() => {
        console.log("Scene initialized and avatar loaded");
      })
      .catch((error) => {
        console.error("Error initializing scene:", error);
      });     
  }

  private async initializeScene() {

    console.log('Azure Subscription Key:', this.subscriptionKey);
    console.log('Azure Region:', this.serviceRegion);
    // Create the canvas HTML element and attach it to the webpage
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    document.body.appendChild(canvas);

    // Prevent page scrolling when the canvas is scrolled
    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault(); // Prevent the default scroll behavior
      },
      { passive: false }
    ); // Use passive: false to allow preventDefault

    // Initialize Babylon scene and engine
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0); //to make bg transparent
    //scene.debugLayer.show({ embedMode: true });

    // Create AvatarLoader and load avatar
    this.avatarLoader = new AvatarLoader(scene);
    const avatarUrl = "/assets/EVI anim.glb"; // Replace with your avatar URL
    await this.avatarLoader.loadAvatar(avatarUrl); // Wait for the avatar to load

    if (this.avatarLoader.avatar) {
      // Get the current position and adjust the y value
      this.adjustedAvatarPositionforCam =
        this.avatarLoader.avatar.position.clone(); // Clone the original position
      this.adjustedAvatarPositionforCam.y += 0.5; // Add 0.5 to the y axis
      this.avatarLoader.avatar.layerMask = 1; // Use layer 1 for avatar
    }

    // Now that the avatar is loaded, create the camera
    const camera: FreeCamera = new FreeCamera(
      "Camera",
      new Vector3(-0.1, 0.85, 2.3),
      scene
    );
    camera.attachControl(canvas, true);
    camera.minZ=0;
    camera.rotation.y = Math.PI;
    // Disable camera inputs to stop mouse drag movement
    camera.inputs.clear(); // Clear all default inputs
    //camera.wheelPrecision = 100;
    camera.layerMask = 1;

    // Add a hemispheric light
    // Create and position Hemispheric Light
    const lightDirection = new Vector3(0, 1, 1); // Point light direction towards the front
    const light1: HemisphericLight = new HemisphericLight(
      "light1",
      lightDirection,
      scene
    );
    light1.groundColor = new Color3(0.1, 0.1, 0.1); // Set ground color if needed
    light1.intensity=1;

    // Create a ground
    MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
    const ground = scene.getMeshByName("ground");
    if (ground) {
      ground.layerMask = 2; // Use layer 2 for ground
    }

    // Add buttons for animation controls
    //this.App_Gui=new App_GUI(this.avatarLoader);
    // this.App_Gui.chatUI();

    // Initialize STT and TTS
    this.stt = new SpeechToText(this.subscriptionKey, this.serviceRegion);
    this.tts = new TextToSpeech(
      this.subscriptionKey,
      this.serviceRegion,
      this.avatarLoader.avatar
    );

    //Initialize questionAnswer
    this.questionAnswer = new CustomerService(); //object of CustomerService class

    //chat Ui
    this.chatUI = new ChatUI(
      this,
      this.tts,
      this.stt,
      this.avatarLoader,
      this.questionAnswer
    );

    // // Set up UI interactions
    // this.setupUI();

    //test
    this.speakAnswer("this is test answeer you need to speak out");

    // Hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === "i") {
        if (scene.debugLayer.isVisible()) {
          scene.debugLayer.hide();
        } else {
          scene.debugLayer.show();
        }
      }
    });

    // Run the main render loop
    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  private setupUI() {
    // Text to Speech
    const ttsInput = document.getElementById("tts-input") as HTMLInputElement;
    const ttsButton = document.getElementById(
      "tts-button"
    ) as HTMLButtonElement;
    const askQuestionInput = document.getElementById(
      "ask-question-button-input"
    ) as HTMLParagraphElement;
    ttsButton.addEventListener("click", () => {
      const answer = this.questionAnswer.getAnswer(ttsInput.value);
      if (answer) {
        askQuestionInput.innerText = ttsInput.value;
        this.tts.speakText(
          answer,
          this.onSpeakingStarted,
          this.onSpeakingEnded
        );
        askQuestionInput.innerText = answer;
      }
    });

    // Speech to Text with button click 
    const sttButton = document.getElementById(
      "stt-button"
    ) as HTMLButtonElement;
    //const sttOutput = document.getElementById("stt-output") as HTMLParagraphElement;
    //const askQuestionButton = document.getElementById("ask-question-button") as HTMLButtonElement;
    sttButton.addEventListener("click", () => {
      if (this.isRecording) {
        this.stt.stopRecognition();
        sttButton.innerText = "Record";
        this.isRecording = false;
      } else {
        // sttOutput.innerText = "Listening...";
        this.stt.startRecognition((text: string) => {
          askQuestionInput.innerText = text;
          // sttButton.innerText = "Stop Recording";
          this.isRecording = true;
          const answer = this.questionAnswer.getAnswer(
            askQuestionInput.innerText
          );
          if (answer) {
            console.log(`Question: ${askQuestionInput.innerText}`);
            console.log(`Answer: ${answer}`);
            this.tts.speakText(
              answer,
              this.onSpeakingStarted,
              this.onSpeakingEnded
            );
            askQuestionInput.innerText = answer;
          } else {
            console.log(`Sorry, we couldn't find an answer to your question.`);
            this.tts.speakText(
              "Sorry, we couldn't find an answer to your question.",
              this.onSpeakingStarted,
              this.onSpeakingEnded
            );
          }
          this.stt.stopRecognition();
        });
      }
    });
  }

  //directly speak what ever parameter i pass
  speakAnswer(answer: string): void {
    if (answer) {
        console.log(`Answer: ${answer}`);
        this.tts.speakText(
            answer,
            this.onSpeakingStarted,
            this.onSpeakingEnded
        );
        const askQuestionInput = document.getElementById("ask-question-button-input") as HTMLParagraphElement;
        askQuestionInput.innerText = answer;
    } else {
        console.log(`Sorry, we couldn't find an answer to your question.`);
        this.tts.speakText(
            "Sorry, we couldn't find an answer to your question.",
            this.onSpeakingStarted,
            this.onSpeakingEnded
        );
    }
}

  public onSpeakingStarted = () => {
    console.log("Speaking has started.");
    // Add any additional actions you want to perform when speaking starts
    this.avatarLoader.stopAllAnimations();
    this.avatarLoader.playAnimation("Talk",true);  
    //this.avatarLoader.playAnimationBetweenFrames("Talk",50,250,true);
    //this.avatarLoader.blendAnimations("Talk","Idle",10);

  };

  public onSpeakingEnded = () => {
    console.log("Speaking has ended.");
    // Add any additional actions you want to perform when speaking ends
    this.avatarLoader.stopAllAnimations();
    this.avatarLoader.playAnimation("Idle",true);
    //this.avatarLoader.playAnimationBetweenFrames("Idle",0,250,true);
    //this.avatarLoader.blendAnimations("Idle","Talk",10);
    // Remove all elements from the visemeData array
    this.tts.visemeData.splice(0, this.tts.visemeData.length);
    this.tts.resetMorphTargets();
  };
}

new App();
