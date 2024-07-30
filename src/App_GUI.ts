import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import { AvatarLoader } from "./AvatarLoader";

export class App_GUI {
  private avatarLoader: AvatarLoader;
  private advancedTexture;
  constructor(_avatarLoader: AvatarLoader) {
    this.avatarLoader = _avatarLoader;
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  }

  public createAnimationButtons(): void {
    //const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const animations = ["Idle", "Running", "Walking", "Jumping"]; // Replace with actual animation names
    animations.forEach((animation, index) => {
      const button = GUI.Button.CreateSimpleButton(
        `button_${animation}`,
        animation
      );
      button.width = "150px";
      button.height = "40px";
      button.color = "white";
      button.background = "green";
      button.top = `${-100 + index * 50}px`; // Position buttons vertically
      button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      button.left = "10px"; // Adjust this to move the button further left or right
      button.top = `${-60 - index * 50}px`; // Stack buttons vertically, add margin

      button.onPointerClickObservable.add(() => {
        this.avatarLoader.stopAllAnimations();
        this.avatarLoader.playAnimation(animation);
      });

      this.advancedTexture.addControl(button);
    });

    const stopButton = GUI.Button.CreateSimpleButton("stopButton", "Stop All");
    stopButton.width = "150px";
    stopButton.height = "40px";
    stopButton.color = "white";
    stopButton.background = "red";
    stopButton.top = "50px"; // Position below the other buttons
    stopButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    stopButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    stopButton.left = "10px";
    stopButton.top = `${-60 - animations.length * 50}px`; // Position below the other buttons

    stopButton.onPointerClickObservable.add(() => {
      this.avatarLoader.stopAllAnimations();
    });

    this.advancedTexture.addControl(stopButton);
  }

  public chatUI(): void {
    // Chat history panel
    const chatPanel = new GUI.StackPanel();
    chatPanel.width = "350px";
    chatPanel.height = "450px";
    chatPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    chatPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    chatPanel.background = "white";
    chatPanel.alpha = 0.8;
    chatPanel.paddingTop = "10px";
    chatPanel.paddingLeft = "10px";
    this.advancedTexture.addControl(chatPanel);

    // Scroll viewer for chat history
    const scrollViewer = new GUI.ScrollViewer();
    scrollViewer.height = "500px";
    scrollViewer.width = "100%";
    scrollViewer.thickness = 0;
    chatPanel.addControl(scrollViewer);

    const chatHistoryStack = new GUI.StackPanel();
    scrollViewer.addControl(chatHistoryStack);

    // Input panel
    const inputPanel = new GUI.StackPanel();
    inputPanel.width = "400px";
    inputPanel.height = "50px";
    inputPanel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    inputPanel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    inputPanel.isVertical = false;
    inputPanel.background = "white";
    inputPanel.alpha = 0.8;
    inputPanel.paddingBottom = "20px";
    this.advancedTexture.addControl(inputPanel);

    const inputText = new GUI.InputText();
    inputText.width = "300px";
    inputText.height = "50px";
    inputText.placeholderText = "Type your question...";
    inputText.color = "black";
    inputText.background = "white";
    inputText.alpha=0.5;
    inputText.color="white";
    inputPanel.addControl(inputText);

    const sendButton = GUI.Button.CreateSimpleButton("sendButton", "Send");
    sendButton.width = "50px";
    sendButton.height = "50px";
    sendButton.color = "white";
    sendButton.background = "green";
    sendButton.onPointerUpObservable.add(() => {
      const userMessage = inputText.text;
      inputText.text = "";

      const userMessageBlock = new GUI.TextBlock();
      userMessageBlock.text = "User: " + userMessage;
      userMessageBlock.color = "black";
      userMessageBlock.height = "30px";
      chatHistoryStack.addControl(userMessageBlock);

      // TODO: Send the userMessage to the chatbot backend and get a response

      const botMessage = "This is a response from the bot.";
      const botMessageBlock = new GUI.TextBlock();
      botMessageBlock.text = "Bot: " + botMessage;
      botMessageBlock.color = "blue";
      botMessageBlock.height = "30px";
      chatHistoryStack.addControl(botMessageBlock);

      scrollViewer.verticalBar.value = 1; // Scroll to the bottom
    });
    inputPanel.addControl(sendButton);

    const micButton = GUI.Button.CreateSimpleButton("micButton", "🎤");
    micButton.width = "50px";
    micButton.height = "50px";
    micButton.color = "white";
    micButton.background = "red";
    micButton.onPointerUpObservable.add(() => {
      // TODO: Implement microphone capture functionality
    });
    inputPanel.addControl(micButton);
  }
  
}
