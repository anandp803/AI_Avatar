import { Scene, AbstractMesh, Vector3, AnimationGroup, SceneLoader } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export class AvatarLoader {
    private scene: Scene;
    public avatar: AbstractMesh | null = null;
    public animationGroups: AnimationGroup[] = [];

    constructor(scene: Scene) {
        this.scene = scene;
    }

    async loadAvatar(url: string): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync("", url, "", this.scene);
            console.log("animation are:- ",result.animationGroups.map(group => group.name));
            this.avatar = result.meshes[0];
            this.animationGroups = result.animationGroups;
            this.checkMorphTargets(this.avatar);       
            if (this.avatar) {
                this.avatar.position = new Vector3(0, 0, 0); // Position the avatar at the origin
            }
            console.log("Avatar loaded successfully");
        } catch (error) {
            console.error("Error loading avatar:", error);
        }
    }

    playAnimation(animationName: string): void {
        const animationGroup = this.animationGroups.find(group => group.name === animationName);   
        if (animationGroup) {
            animationGroup.start(true);
        } else {
            console.warn(`Animation '${animationName}' not found`);
        }
    }

    stopAllAnimations(): void {
        this.animationGroups.forEach(group => group.stop());
    }

    private checkMorphTargets(mesh: AbstractMesh): void {
        const morphTargetManagers = mesh.getChildMeshes().map(m => m.morphTargetManager).filter(Boolean);
        morphTargetManagers.forEach((manager, index) => {
            console.log(`Morph Targets for Mesh ${index}:`, manager!.numTargets);
            for (let i = 0; i < manager!.numTargets; i++) {
                console.log(`Morph Target ${i}:`, manager!.getTarget(i)?.name);
            }
        });
    }

    public getAvatar(): AbstractMesh {
        return this.avatar;
    }
}
