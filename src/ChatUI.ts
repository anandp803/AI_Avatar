// ChatUI.ts

import { App } from "./app";
import { AvatarLoader } from "./AvatarLoader";
import { CustomerService } from "./questionAnswer";
import { SpeechToText } from "./speechtotext";
import { TextToSpeech } from "./texttospeech";

export class ChatUI {
    private chatBubble: HTMLElement;
    private chatContainer: HTMLElement;
    private closeChat: HTMLElement;
    private sendChat: HTMLElement;
    private micChat: HTMLElement;
    private chatInput: HTMLInputElement;
    private chatHistory: HTMLElement;
    private isShowChatWindow:boolean=false;

    private isRecording: boolean = false;

    constructor(private app:App, private tts:TextToSpeech,private stt:SpeechToText, private avatar:AvatarLoader,private QnA:CustomerService) {
        this.chatBubble = document.getElementById("chatBubble");
        this.chatContainer = document.getElementById("chatContainer");
        this.closeChat = document.getElementById("closeChat");
        this.sendChat = document.getElementById("sendChat");
        this.micChat = document.getElementById("micChat");
        this.chatInput = document.getElementById("chatInput") as HTMLInputElement;
        this.chatHistory = document.getElementById("chatHistory");

        this.init();
    }

    private init() {
        this.chatBubble.addEventListener("click", () => this.toggleChatContainer());
        this.closeChat.addEventListener("click", () => this.closeChatContainer());
        this.sendChat.addEventListener("click", () => this.sendMessage());
        this.micChat.addEventListener("click", () => this.AudioMessage());
    }

    private toggleChatContainer() {
        // Check if the chat container is either hidden or not explicitly set, and then toggle its display
        this.chatContainer.style.display = (this.chatContainer.style.display === "none" || this.chatContainer.style.display === "") ? "flex" : "none";

    }

    private closeChatContainer() {
        this.chatContainer.style.display = "none";
    }

    private sendMessage() {
        const userMessage = this.chatInput.value.trim();
        if (userMessage) {
            this.addMessageToChat("User", userMessage);
            this.chatInput.value = "";

            const answer = this.QnA.getAnswer(userMessage);
           if (answer) {
               this.tts.speakText(answer,this.app.onSpeakingStarted,this.app.onSpeakingEnded);
               this.addMessageToChat("Bot", answer);
           }            
        }
    }

    private AudioMessage() {
        if (this.isRecording) {           
            this.stt.stopRecognition();    
            console.log("stop recording");       
            this.isRecording = false;              
        } else {          
            this.micChat.style.backgroundColor="#fb0000";
            this.stt.startRecognition((text: string) => {                   
                console.log("started recording");           
                this.isRecording = true;
                this.addMessageToChat("User", text);
                const answer = this.QnA.getAnswer(text);
                if (answer) {
                    console.log(`Question: ${text}`);
                    console.log(`Answer: ${answer}`);
                    this.addMessageToChat("Bot", answer);
                    this.tts.speakText(answer,this.app.onSpeakingStarted,this.app.onSpeakingEnded);                                        
                } else {
                    console.log(`Sorry, we couldn't find an answer to your question.`);
                    this.tts.speakText("Sorry, we couldn't find an answer to your question.",this.app.onSpeakingStarted,this.app.onSpeakingEnded);
                    this.addMessageToChat("Bot", "Sorry, we couldn't find an answer to your question.");
                }
                this.stt.stopRecognition();
                this.micChat.style.backgroundColor="#ff6d43";
                console.log("stop recording"); 
            });
        }
    }

    private addMessageToChat(sender: string, message: string) {
        const messageElement = document.createElement("div");
        messageElement.className = "chat-message";
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        this.chatHistory.appendChild(messageElement);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
}
