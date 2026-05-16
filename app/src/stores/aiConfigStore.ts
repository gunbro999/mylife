import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIProviderId } from "@/lib/ai-types";
import { AI_PROVIDERS } from "@/lib/ai-types";

interface AIConfigState {
  selectedProvider: AIProviderId;
  apiKeys: Partial<Record<AIProviderId, string>>;
  selectedModels: Partial<Record<AIProviderId, string>>;
  customEndpoint: string;
  creativity: number;

  setSelectedProvider: (provider: AIProviderId) => void;
  setApiKey: (provider: AIProviderId, key: string) => void;
  setSelectedModel: (provider: AIProviderId, model: string) => void;
  setCustomEndpoint: (endpoint: string) => void;
  setCreativity: (value: number) => void;
  getActiveConfig: () => {
    provider: AIProviderId;
    apiKey: string;
    endpoint: string;
    model: string;
  };
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      selectedProvider: "claude",
      apiKeys: {},
      selectedModels: {},
      customEndpoint: "",
      creativity: 0.7,

      setSelectedProvider: (provider) => set({ selectedProvider: provider }),

      setApiKey: (provider, key) =>
        set((s) => ({ apiKeys: { ...s.apiKeys, [provider]: key } })),

      setSelectedModel: (provider, model) =>
        set((s) => ({ selectedModels: { ...s.selectedModels, [provider]: model } })),

      setCustomEndpoint: (endpoint) => set({ customEndpoint: endpoint }),

      setCreativity: (value) => set({ creativity: value }),

      getActiveConfig: () => {
        const { selectedProvider, apiKeys, selectedModels, customEndpoint } = get();
        const config = AI_PROVIDERS[selectedProvider];
        return {
          provider: selectedProvider,
          apiKey: apiKeys[selectedProvider] || "",
          endpoint: selectedProvider === "custom" ? customEndpoint : config.defaultEndpoint,
          model: selectedModels[selectedProvider] || config.defaultModel,
        };
      },
    }),
    {
      name: "mylife-ai-config",
      partialize: (state) => ({
        selectedProvider: state.selectedProvider,
        apiKeys: state.apiKeys,
        selectedModels: state.selectedModels,
        customEndpoint: state.customEndpoint,
        creativity: state.creativity,
      }),
    }
  )
);
