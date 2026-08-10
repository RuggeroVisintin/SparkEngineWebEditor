import { MaterialComponent } from "@sparkengine";
import { ImageRepository } from "../../assets";
import { SceneRepository } from "../../scene";
import { Project, ProjectRepository } from "../domain";
import { WeakRef } from "../../common";

export class SaveProjectUseCase {
    public constructor(
        private readonly projectRepository: ProjectRepository,
        private readonly sceneRepository: SceneRepository,
        private readonly imageRepository: ImageRepository
    ) { }

    public async execute(project: Project): Promise<Project> {
        // TODO -- copy all image assets in the asset folder

        if (project.scopeRef.isEmpty()) {
            const newProject = await this.projectRepository.save(project);
            await Promise.all([
                newProject.saveScenes(this.sceneRepository),
                this.copyAssets(newProject)
            ]);

            return newProject;
        } else {
            await Promise.all([
                this.projectRepository.update(project),
                project.saveScenes(this.sceneRepository),
                this.copyAssets(project)
            ]);

            return project;
        }
    }

    private async copyAssets(project: Project): Promise<void> {
        await Promise.all(project.scenes.map(async (scene) => {
            await Promise.all(scene.entities.map(async (entity) => {
                const material = entity.getComponent<MaterialComponent>('MaterialComponent')!;

                if (!material || !material.diffuseTexture || !material.diffuseTexturePath) {
                    return;
                }

                await this.imageRepository.save(material.diffuseTexture, {
                    path: material.diffuseTexturePath,
                    accessScope: project.scopeRef as WeakRef<FileSystemDirectoryHandle>
                });
            }))
        }))
    }
}