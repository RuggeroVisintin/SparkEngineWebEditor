import { createContext, ReactNode, useContext, useState } from "react";
import { FileSystemImageRepository, FileSystemSoundRepository } from "../core/assets";

export interface AssetRepositories {
    imageRepository: FileSystemImageRepository;
    soundRepository: FileSystemSoundRepository;
}

const AssetRepositoriesContext = createContext<AssetRepositories | null>(null);

export const AssetProvider = ({ children }: { children: ReactNode }) => {
    const [repositories] = useState<AssetRepositories>(() => ({
        imageRepository: new FileSystemImageRepository(),
        soundRepository: new FileSystemSoundRepository()
    }));

    return (
        <AssetRepositoriesContext.Provider value={repositories}>
            {children}
        </AssetRepositoriesContext.Provider>
    );
};

export const useAssetRepositories = (): AssetRepositories => {
    const repositories = useContext(AssetRepositoriesContext);

    if (!repositories) {
        throw new Error("useAssetRepositories must be used within AssetProvider");
    }

    return repositories;
};