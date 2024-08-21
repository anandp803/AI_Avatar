import { Scene, AbstractMesh, Vector3, AnimationGroup, SceneLoader, MorphTarget } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export class AvatarLoader {
    private scene: Scene;
    public avatar: AbstractMesh | null = null;
    public animationGroups: AnimationGroup[] = [];    
    private leftEye: MorphTarget | undefined;
    private rightEye: MorphTarget | undefined;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    async loadAvatar(url: string): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync("", url, "", this.scene);
            console.log("animation are:- ",result.animationGroups.map(group => group.name));
            this.avatar = result.meshes[0];
            //this.leftEye = this.avatar.morphTargetManager?.getTarget(0);
            //this.rightEye = this.avatar.morphTargetManager?.getTarget(1);
            this.animationGroups = result.animationGroups;
            this.checkMorphTargets(this.avatar);       
            if (this.avatar) {
                this.avatar.position = new Vector3(0, 0, 0); // Position the avatar at the origin
            }
            console.log("Avatar loaded successfully");
             // After loading the avatar, load animations
             await this.loadAnimations([
                "/assets/animations/F_Standing_Idle_Variations_001.glb",
                "/assets/animations/F_Standing_Idle_Variations_002.glb",
                "/assets/animations/F_Standing_Idle_Variations_003.glb",
                "/assets/animations/F_Talking_Variations_001.glb",
                "/assets/animations/F_Talking_Variations_002.glb",
                "/assets/animations/F_Talking_Variations_003.glb"
            ]);
            console.log("animation after loading extra are:- ",result.animationGroups.map(group => group.name));
        } catch (error) {
            console.error("Error loading avatar:", error);
        }

        
    }

    async loadAnimations(animationUrls: string[]): Promise<void> {
        try {
            for (const url of animationUrls) {
                const result = await SceneLoader.ImportMeshAsync("", url, "", this.scene);
                const newAnimationGroup = result.animationGroups[0];
    
                if (newAnimationGroup && this.avatar) {
                    // Ensure the animation applies to the avatar's skeleton or meshes
                    newAnimationGroup.targetedAnimations.forEach(ta => {
                        ta.target = this.avatar; // Reassign the animation target to the avatar
                    });
                    this.animationGroups.push(newAnimationGroup);
    
                    console.log(`Loaded animation from ${url}`);
                }
            }
        } catch (error) {
            console.error("Error loading animations:", error);
        }
    }

    playAnimation(animationName: string, loop: boolean = true): void {
        this.stopAllAnimations(); // Ensure no other animations are playing
        const animationGroup = this.animationGroups.find(group => group.name === animationName);   
        if (animationGroup) {
            animationGroup.start(loop);
        } else {
            console.warn(`Animation '${animationName}' not found`);
        }
    }

    playAnimationBetweenFrames(animationName: string, fromFrame: number, toFrame: number, loop: boolean = false): void {
        this.stopAllAnimations();
        const animationGroup = this.animationGroups.find(group => group.name === animationName);
        if (animationGroup) {
            animationGroup.start(loop, 1.0, fromFrame, toFrame);
        } else {
            console.warn(`Animation '${animationName}' not found`);
        }
    }

    playIdleAnimation(): void {
        const idleAnimations = this.animationGroups.filter(group => group.name.includes("Idle"));
        if (idleAnimations.length > 0) {
            this.stopAllAnimations();
            idleAnimations[0].start(true); // Play the first idle animation
        }
    }

    playTalkingAnimation(): void {
        const talkingAnimations = this.animationGroups.filter(group => group.name.includes("Talking"));
        if (talkingAnimations.length > 0) {
            this.stopAllAnimations();
            talkingAnimations[0].start(false); // Play the first talking animation without looping
        }
    }   

    blendAnimations(startAnimationName: string, nextAnimationName: string, duration: number): void {
        const idleAnimationGroup = this.animationGroups.find(group => group.name === startAnimationName);
        const talkingAnimationGroup = this.animationGroups.find(group => group.name === nextAnimationName);

        if (idleAnimationGroup && talkingAnimationGroup) {
            idleAnimationGroup.start(true, 1.0);  // Start idle animation
            talkingAnimationGroup.start(true, 0.0);  // Start talking animation with 0 weight
            talkingAnimationGroup.speedRatio=2;

            let blendAmount = 0;
            const blendStep = 1 / (duration * 60);  // Assuming 60 frames per second

            const blending = () => {
                blendAmount += blendStep;

                if (blendAmount < 1) {
                    idleAnimationGroup.setWeightForAllAnimatables(1 - blendAmount);
                    talkingAnimationGroup.setWeightForAllAnimatables(blendAmount);

                    requestAnimationFrame(blending);  // Continue blending in the next frame
                } else {
                    idleAnimationGroup.stop();  // Stop idle animation once fully transitioned
                }
            };

            blending();  // Start blending process
        } else {
            console.warn(`Animations '${startAnimationName}' or '${nextAnimationName}' not found`);
        }
    }
  

    stopAllAnimations(): void {
        this.animationGroups.forEach(group => group.stop());
    }

    private checkMorphTargets(mesh: AbstractMesh): void {
        const morphTargetManagers = mesh.getChildMeshes().map(m => m.morphTargetManager).filter(Boolean);
        morphTargetManagers.forEach((manager, index) => {
           // console.log(`Morph Targets for Mesh ${index}:`, manager!.numTargets);
            for (let i = 0; i < manager!.numTargets; i++) {
              //  console.log(`Morph Target ${i}:`, manager!.getTarget(i)?.name);
            }
        });
    }

    public getAvatar(): AbstractMesh {
        return this.avatar;
    }
}
