"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, 
  Loader2, 
  Zap,
  Copy, 
  Check, 
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Twitter,
  Globe,
  Layout,
  PenLine,
  RefreshCw} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { generateAICall } from '../lib/ai';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const platforms = [
  { id: 'reddit', name: 'Reddit', desc: 'Value-first. Lead with insight.', icon: MessageSquare, color: '#FF4500', available: true },
  { id: 'twitter', name: 'X (Twitter)', desc: 'Hook-first. Punchy and direct.', icon: Twitter, color: '#FFFFFF', available: true },
  { id: 'threads', name: 'Threads', desc: 'Conversational & personal.', icon: MessageSquare, color: '#FFFFFF', available: true },
  { id: 'ih', name: 'Indie Hackers', desc: 'Founder stories win here.', icon: Globe, color: '#0073b1', available: true },
  { id: 'ph', name: 'Product Hunt', desc: 'Make your launch land.', icon: Zap, color: '#da552f', available: true },
  { id: 'linkedin', name: 'LinkedIn', desc: 'Professional + personal mix.', icon: Layout, color: '#0077b5', available: true },
];

const formats = [
  { 
    id: 'struggle', 
    name: 'The Relatable Struggle', 
    desc: 'I was X, until I did Y', 
    traction: 'High', 
    engagement: 78,
    why: 'People comment because they\'ve been there too'
  },
  { 
    id: 'hot-take', 
    name: 'Hot Take + Proof', 
    desc: 'Unpopular opinion: [your insight]', 
    traction: 'High', 
    engagement: 85,
    why: 'Controversial hooks drive 3x more replies'
  },
  { 
    id: 'learned', 
    name: 'What I Learned After Z', 
    desc: 'After [milestone], here\'s what actually worked', 
    traction: 'Medium', 
    engagement: 62,
    why: 'Authority + story = shares'
  },
];

export default function PostMaker() {
  const { user } = useAuth();
  const [brain, setBrain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('platform');
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [post, setPost] = useState(null);
  const [tone, setTone] = useState('Authentic Founder');
  const [context, setContext] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  
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

        const { data } = await supabase
          .from('brand_brains')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) setBrain(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const generatePost = async () => {
    if (!brain) return;
    setStep('output');
    setGenerating(true);
    
    const systemPrompt = `You are a real founder. Not a marketer. Not a content strategist. A person who built or found something that genuinely helped them, and now wants to tell other people about it in plain, honest words.

You are writing ONE post for Twitter/X. It must feel like something a real human typed on their phone after a long day — not something that came out of a content calendar. Raw. Direct. True.

Follow this exact 6-part structure. Each part is its own short paragraph. One blank line between each part. Do not label the parts. Do not add anything before or after the post. Return only the post text.

--- 
PART 1 — HOOKThis is the only line that decides if anyone reads the rest. Use one of the exact pain phrases the founder gave you, in their own words or very close to it. Name the frustration so specifically that the right person reads it and feels like someone finally said it out loud. Maximum 12 words. No period at the end. No hashtags. No emojis unless the founder's tone is genuinely casual. If a question adds real tension, use it — otherwise don't.

PART 2 — RELATE
One sentence. The founder is saying: I know this pain because I lived it, or I see it every day in the people I talk to. This is not sympathy — it is proof that the founder is one of them. It makes the reader feel like they are in the right place.

PART 3 — TURN
One line only. Something shifted. Something was discovered. Do not name the solution yet. Just signal that a door opened. This creates a small open loop that pulls the reader forward. It should feel like the moment before a reveal, not the reveal itself.

PART 4 — PROOF
One to two sentences. Now introduce the product — but casually, the way a founder mentions something they built or stumbled onto, not the way an ad talks about a product. State the single biggest differentiator as a plain fact. Concrete and specific beats vague and impressive every time. Do not use any of these words: game-changing, revolutionary, powerful, robust, seamless, cutting-edge, innovative, disruptive, supercharge, unlock, leverage, synergy, crushing it, hustle.

PART 5 — SPECIFICITY
One line. Drop one real, concrete detail — a number, a timeframe, a before-and-after, a specific result. This is what makes the post feel like a true story and not a pitch. If the founder did not provide a specific number, create a believable, modest one that fits an early-stage product. Do not exaggerate. Small and real is better than big and suspicious.

PART 6 — CTA
One sentence. Use the founder's call to action exactly as they described it. Keep it direct and low-pressure. No exclamation mark. No emoji. No asking for likes, shares, or follows. Just tell them what to do next.

--- 
HARD RULES — these apply to every word in the post:

- No hashtags anywhere
- No em dashes
- No corporate or hype language of any kind- No more than 3 sentences in any paragraph
- Total word count must be between 180 and 280 words
- The entire post must sound like one specific person wrote it — not a team, not a tool- Fully respect the writing tone and style the founder described
- If the target audience has LOW awareness (they do not yet know a solution like this exists): educate them gently in Parts 2 and 3 before introducing the product
- If the target audience has HIGH awareness (they have already tried other tools and been disappointed): skip the education, differentiate immediately, and speak to why this is different from what they already tried`;

    const userMessage = `Here is everything you need to write the post:

App name: ${brain?.app_name || ''}
What the app does: ${brain?.app_description || ''}
Target customer: ${brain?.target_customer || ''}
Core problem the app solves: ${brain?.core_problem || ''}
What makes it different from alternatives: ${brain?.unique_differentiator || ''}
Brand tone: ${brain?.brand_tone || ''}
Writing style: ${brain?.writing_style || ''}
Primary CTA: ${brain?.primary_cta || ''}

Write the post now. Return only the post. Nothing else.`;

    try {
      // Pass user ID so generateAICall can inject brand context
      const result = await generateAICall(systemPrompt, userMessage, user?.id);
      setPost(result);
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error("Something went wrong generating your post.");
    } finally {
      setGenerating(false);
    }
  };