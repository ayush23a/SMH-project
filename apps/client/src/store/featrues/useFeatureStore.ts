import { FeatureEnum } from "@/src/types/FeatureEnum";
import { create } from "zustand";

interface FeatureStore {
    selectedFeature: FeatureEnum;
    updateSeletedFeature: (feature: FeatureEnum) => void;
}

export const useFeatureStore = create<FeatureStore>((set) => ({
    selectedFeature: FeatureEnum.NONE,
    updateSeletedFeature: (feature: FeatureEnum) => set({ selectedFeature: feature }),
}));