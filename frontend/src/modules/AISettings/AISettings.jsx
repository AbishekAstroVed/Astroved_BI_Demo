import React, { useState, useEffect } from 'react';
import {
  Brain, Cpu, Key, Box, Clock, Save, FileText,
  Database, Thermometer, Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';

const AISettings = () => {
  const userPermissions = JSON.parse(localStorage.getItem('astroved_permissions') || '{}');
  const crud = userPermissions?.crud || { edit: true, view: true, delete: true, create: true };
  const [aiSettings, setAiSettings] = useState({
    apiKey: '',
    model: 'gpt-5.5',
    refreshInterval: '6 Hours',
    maxTokens: 2048,
    temperature: 0.7,
    enabled: true,
    prompts: ''
  });
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  useEffect(() => {
    loadAISettings();
  }, []);

  const loadAISettings = async () => {
    try {
      const data = await api.getAISettings();
      if (data) setAiSettings(data);
    } catch (err) {
      console.error('Failed to load AI settings:', err);
    }
  };

  const handleSaveAISettings = async () => {
    if (crud.edit === false) {
      toast.error('Access Denied: Your role does not have Edit permissions.');
      return;
    }
    try {
      await api.updateAISettings(aiSettings);
      toast.success('Saved Cognitive AI Configurations!');
      setIsEditingApiKey(false);
      setIsEditingPrompt(false);
      loadAISettings();

      await api.createAuditLog({
        user: 'Super Admin',
        action: 'Updated AI Cognitive engine prompts & settings',
        module: 'AI Settings',
        ip: '127.0.0.1',
        browser: navigator.userAgent
      });
    } catch (err) {
      toast.error('Failed to save AI configurations');
    }
  };

  return (
    <div className="space-y-6">

      {/* Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Card: API & Model Config */}
        <div className="border border-cosmic-border rounded-xl p-5 space-y-5 bg-cosmic-card flex flex-col justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Cpu size={16} />
            <span>API & Model Configuration</span>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-2">OpenAI API Key</label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-cosmic-bg border border-cosmic-border px-4 py-3 rounded-xl gap-3 sm:gap-0">
                <div className="flex items-center space-x-3 w-full sm:w-auto overflow-hidden">
                  <Key size={14} className="text-cosmic-muted shrink-0" />
                  <span className="text-xs text-cosmic-text font-medium font-mono truncate">
                    {aiSettings.apiKey ? 'sk-••••••••••••••••••••' : 'No Key Configured'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (aiSettings.apiKey) {
                      setAiSettings({ ...aiSettings, apiKey: '' });
                    } else {
                      const key = window.prompt("Enter new API Key:");
                      if (key) {
                        setAiSettings({ ...aiSettings, apiKey: key });
                        toast.success("API Key updated locally.");
                      }
                    }
                  }}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 whitespace-nowrap"
                >
                  Change API Key &gt;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-2 flex items-center space-x-1">
                  <Box size={12} className="text-indigo-500" />
                  <span>AI Model Selection</span>
                </label>
                <select
                  value={aiSettings.model}
                  onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none"
                >
                  <option value="gpt-5.5">GPT-5.5 (Recommended)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-cosmic-muted uppercase block mb-2 flex items-center space-x-1">
                  <Clock size={12} className="text-indigo-500" />
                  <span>AI Refresh Interval</span>
                </label>
                <select
                  value={aiSettings.refreshInterval}
                  onChange={(e) => setAiSettings({ ...aiSettings, refreshInterval: e.target.value })}
                  className="w-full bg-cosmic-bg border border-cosmic-border text-xs text-cosmic-text px-3 py-2 rounded-lg focus:outline-none"
                >
                  <option>1 Hour</option>
                  <option>6 Hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 mt-auto">
            <button
              onClick={handleSaveAISettings}
              className="w-full py-2.5 bg-[#6868f9] border border-cosmic-border hover:border-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* Right Card: Prompt Template */}
        <div className="border border-cosmic-border rounded-xl p-5 space-y-4 bg-cosmic-card flex flex-col h-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-cosmic-text font-bold text-xs">
              <FileText size={16} className="text-indigo-500" />
              <span>Prompt Template Context</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              {aiSettings.prompts?.length || 0} Characters
            </span>
          </div>

          <div className="flex-1 relative border-l-4 border-cosmic-border pl-4 py-1">
            <textarea
              value={aiSettings.prompts}
              onChange={(e) => setAiSettings({ ...aiSettings, prompts: e.target.value })}
              readOnly={!isEditingPrompt}
              className="w-full h-full min-h-[160px] bg-transparent text-[13px] text-cosmic-text leading-relaxed resize-none focus:outline-none placeholder-cosmic-muted"
              placeholder="Enter prompt..."
            />
          </div>

          <div className="flex justify-end text-[10px] font-bold text-indigo-400">
            {aiSettings.prompts?.length || 0} / 2000
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="border border-cosmic-border rounded-xl p-4 bg-cosmic-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto">

          {/* Max Tokens */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg border border-cosmic-border flex items-center justify-center text-indigo-500">
              <Database size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-cosmic-muted uppercase">Max Tokens</p>
              <p className="text-lg font-black text-indigo-400">{aiSettings.maxTokens || 2048}</p>
            </div>
          </div>

          <div className="w-px h-10 bg-cosmic-border hidden md:block"></div>

          {/* Temperature */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg border border-cosmic-border flex items-center justify-center text-indigo-500">
              <Thermometer size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-cosmic-muted uppercase">Temperature</p>
              <p className="text-lg font-black text-indigo-400">{aiSettings.temperature || 0.7}</p>
            </div>
          </div>

        </div>

        <button
          onClick={() => setIsEditingPrompt(!isEditingPrompt)}
          className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Edit3 size={16} />
          <span>{isEditingPrompt ? 'Save Prompt Template' : 'Edit Prompt Template'}</span>
        </button>
      </div>
      <div className="pb-12"></div>
    </div>
  );
};

export default AISettings;
