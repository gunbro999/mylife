"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown, Key, Settings, Check } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { useAIConfigStore } from "@/stores/aiConfigStore";
import { AI_PROVIDERS } from "@/lib/ai-types";
import type { AIActionType, AIProviderId } from "@/lib/ai-types";
import { ContinueWriting } from "./ContinueWriting";
import { StyleRewrite } from "./StyleRewrite";
import { PolishOptimize } from "./PolishOptimize";
import { cn } from "@/lib/utils";

const TABS: { key: AIActionType; label: string; icon: string }[] = [
  { key: "continue", label: "续写", icon: "✍️" },
  { key: "rewrite", label: "改写", icon: "🔄" },
  { key: "polish", label: "润色", icon: "✨" },
];

export function AIPanel() {
  const aiPanelOpen = useUIStore((s) => s.aiPanelOpen);
  const toggleAIPanel = useUIStore((s) => s.toggleAIPanel);
  const selectedProvider = useAIConfigStore((s) => s.selectedProvider);
  const setSelectedProvider = useAIConfigStore((s) => s.setSelectedProvider);
  const apiKeys = useAIConfigStore((s) => s.apiKeys);
  const setApiKey = useAIConfigStore((s) => s.setApiKey);
  const selectedModels = useAIConfigStore((s) => s.selectedModels);
  const setSelectedModel = useAIConfigStore((s) => s.setSelectedModel);
  const [activeTab, setActiveTab] = useState<AIActionType>("continue");
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentProvider = AI_PROVIDERS[selectedProvider];
  const currentKey = apiKeys[selectedProvider] || "";
  const currentModel = selectedModels[selectedProvider] || currentProvider.defaultModel;
  const [keyInput, setKeyInput] = useState(currentKey);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = () => {
    setApiKey(selectedProvider, keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="shrink-0 border-l border-border bg-bg-elevated/90 backdrop-blur-sm overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <span className="text-sm font-display font-semibold text-text-primary tracking-wider">
                文思
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Settings toggle */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "p-1 rounded-full transition-colors",
                  showSettings
                    ? "text-accent bg-accent-soft"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-secondary"
                )}
                title="API 设置"
              >
                <Settings size={13} />
              </button>
              {/* Provider selector */}
              <div className="relative">
                <button
                  onClick={() => setShowProviderMenu(!showProviderMenu)}
                  className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  <span>{currentProvider.icon}</span>
                  <span>{currentProvider.name}</span>
                  <ChevronDown size={10} />
                </button>
                {showProviderMenu && (
                  <div className="absolute right-0 top-6 z-50 rounded-xl border border-border bg-bg-elevated shadow-lg p-1 min-w-[140px]">
                    {(Object.entries(AI_PROVIDERS) as [AIProviderId, typeof AI_PROVIDERS[AIProviderId]][]).map(
                      ([id, config]) => (
                        <button
                          key={id}
                          onClick={() => {
                            setSelectedProvider(id);
                            setKeyInput(apiKeys[id] || "");
                            setShowProviderMenu(false);
                          }}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-lg px-2.5 py-1.5 text-xs transition-colors text-left",
                            selectedProvider === id
                              ? "bg-accent-soft text-accent"
                              : "text-text-secondary hover:bg-bg-secondary"
                          )}
                        >
                          <span>{config.icon}</span>
                          <div>
                            <div className="font-medium">{config.name}</div>
                            <div className="text-[9px] text-text-tertiary">{config.description.slice(0, 20)}</div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={toggleAIPanel}
                className="p-1 rounded-full text-text-tertiary hover:text-text-primary hover:bg-bg-secondary transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-border"
              >
                <div className="px-4 py-3 space-y-3 bg-bg-secondary/30">
                  {/* API Key */}
                  <div>
                    <label className="text-[10px] font-display text-text-tertiary tracking-wider flex items-center gap-1 mb-1">
                      <Key size={10} />
                      {currentProvider.apiKeyLabel}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder={currentProvider.apiKeyHelp}
                        className="flex-1 text-[11px] bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 outline-none text-text-primary placeholder:text-text-tertiary/50 focus:border-accent/40 font-mono"
                      />
                      <button
                        onClick={handleSaveKey}
                        className="shrink-0 flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-accent/90 transition-all"
                      >
                        {keySaved ? <Check size={12} /> : "保存"}
                      </button>
                    </div>
                  </div>

                  {/* Model selector */}
                  <div>
                    <label className="text-[10px] font-display text-text-tertiary tracking-wider block mb-1">
                      模型选择
                    </label>
                    <select
                      value={currentModel}
                      onChange={(e) => setSelectedModel(selectedProvider, e.target.value)}
                      className="w-full text-[11px] bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 outline-none text-text-primary focus:border-accent/40"
                    >
                      {currentProvider.models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="text-[9px] text-text-tertiary">
                    API Key 仅保存在浏览器本地，不会上传到任何服务器
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-all border-b-2",
                  activeTab === tab.key
                    ? "border-accent text-accent bg-accent-soft/50"
                    : "border-transparent text-text-tertiary hover:text-text-secondary hover:bg-bg-secondary/50"
                )}
              >
                <span>{tab.icon}</span>
                <span className="font-display tracking-wider">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4 ai-panel-scroll">
            {activeTab === "continue" && <ContinueWriting />}
            {activeTab === "rewrite" && <StyleRewrite />}
            {activeTab === "polish" && <PolishOptimize />}
          </div>

          {/* Bottom status */}
          <div className="px-4 py-1.5 border-t border-border text-[9px] text-text-tertiary text-center">
            {currentProvider.icon} {currentProvider.name}
            {currentKey ? " · Key 已配置" : " · 点击 ⚙ 配置 Key"}
            {" · "}{currentModel}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
