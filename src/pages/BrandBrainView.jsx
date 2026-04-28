"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../lib/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Brain, 
  RefreshCw, 
  Target, 
  Zap, 
  MessageSquare, 
  Sparkles, 
  Globe, 
  PenTool, 
  Activity,
  Tag,
  Edit2,
  Check,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function BrandBrainView() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showUpdateBox, setShowUpdateBox] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const { data: paymentData } = await supabase
          .from('user_payments')
          .select('payment_status')
          .eq('email', user.email)
          .maybeSingle();
        
        if (paymentData?.payment_status) {
          setIsPaid(true);
        }

        const { data, error } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setBrain(data);
        } else if (!error) {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Error fetching brand brain:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, navigate]);

  const handleSaveField = async (field) => {
    try {
      const { error } = await supabase
        .from('brand_brains')
        .update({ [field]: editValue })
        .eq('user_id', user.id);

      if (error) throw error;

      setBrain({ ...brain, [field]: editValue });
      setEditingField(null);
      toast.success(`${field.replace('_', ' ')} updated!`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update field.");
    }
  };

  const handleSaveUpdate = async () => {
    if (!updateText.trim()) return;
    try {
      const { error } = await supabase
        .from('brand_brains')
        .update({ latest_update: updateText })
        .eq('user_id', user.id);

      if (error) throw error;

      setBrain({ ...brain, latest_update: updateText });
      setUpdateText("");
      setShowUpdateBox(false);
      toast.success("App update recorded!");
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to save update. Make sure your database is updated.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const InfoCard = ({ label, field, value, icon: Icon, isTags = false }) => {
    const isEditing = editingField === field;

    return (
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4 relative group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
          </div>
          {!isEditing && (
            <button 
              onClick={() => {
                setEditingField(field);
                setEditValue(value || "");
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-md transition-all bg-transparent"
            >
              <Edit2 className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>

        <div className="pl-1">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-black/40 border border-orange-500/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all resize-none min-h-[80px]"
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-md hover:bg-white/5 text-gray-500 transition-all bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSaveField(field)}
                  className="p-1.5 rounded-md bg-orange-500 text-white transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : isTags ? (
            <div className="flex flex-wrap gap-2">
              {value?.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-gray-300">
                  {tag.trim()}
                </span>
              ))}
              {!value && <span className="text-xs text-gray-600">Not set</span>}
            </div>
          ) : (
            <p className="text-sm font-medium text-white leading-relaxed">
              {value || 'Not set'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-poppins flex relative overflow-hidden">
      <Sidebar isPaid={isPaid} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-white">Brand Brain</h1>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Update Prompt */}
          <section className="rounded-2xl p-6 border border-white/5 bg-[#111111] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Have an App update?</h2>
                <p className="text-sm text-gray-500">Keep your Brand Brain in sync with your latest features.</p>
              </div>
              <button 
                onClick={() => setShowUpdateBox(!showUpdateBox)}
                className="px-4 py-2 rounded-lg border border-orange-500 text-white text-xs font-bold hover:bg-orange-500/5 transition-all flex items-center gap-2 bg-transparent"
              >
                <Plus className="w-3 h-3" />
                Update brand brain
              </button>
            </div>

            {showUpdateBox && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="Describe your update (e.g. Added a new pricing tier, launched the mobile app...)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-all resize-none min-h-[120px]"
                />
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowUpdateBox(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-all bg-transparent"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveUpdate}
                    className="px-6 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold transition-all"
                  >
                    Save Update
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Latest Update Box */}
          {brain?.latest_update && (
            <section className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 relative">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Latest Update</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                "{brain.latest_update}"
              </p>
            </section>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-1">
              <InfoCard label="App Name" field="app_name" value={brain?.app_name} icon={Sparkles} />
            </div>
            <div className="md:col-span-2">
              <InfoCard label="App Description" field="app_description" value={brain?.app_description} icon={MessageSquare} />
            </div>
            
            <InfoCard label="Target Audience" field="target_customer" value={brain?.target_customer} icon={Target} />
            <InfoCard label="Core Problem" field="core_problem" value={brain?.core_problem} icon={Activity} />
            <InfoCard label="Unique Advantage" field="unique_differentiator" value={brain?.unique_differentiator} icon={Zap} />

            <div className="md:col-span-2">
              <InfoCard label="Pain Phrases" field="pain_phrases" value={brain?.pain_phrases} icon={Tag} isTags={true} />
            </div>

            <InfoCard label="Brand Tone" field="brand_tone" value={brain?.brand_tone} icon={Brain} />
            <InfoCard label="Writing Style" field="writing_style" value={brain?.writing_style} icon={PenTool} />
            <InfoCard label="Primary Platforms" field="primary_platform" value={brain?.primary_platform} icon={Globe} isTags={true} />
            
            <div className="md:col-span-3">
              <InfoCard label="Primary Call to Action" field="primary_cta" value={brain?.primary_cta} icon={Zap} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}