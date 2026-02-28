'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Lock, Eye, Shield, Link as LinkIcon, ArrowRight } from 'lucide-react';

interface LinkedInUrlScreenProps {
    onSubmitUrl: (url: string) => void;
    onSkip: () => void;
}

function isValidLinkedInUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.hostname.includes('linkedin.com') && url.includes('/in/');
    } catch {
        return false;
    }
}

export default function LinkedInUrlScreen({ onSubmitUrl, onSkip }: LinkedInUrlScreenProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    function handleSubmit() {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
            toast.error('Please enter your LinkedIn profile URL');
            return;
        }

        if (!isValidLinkedInUrl(trimmedUrl)) {
            toast.error('Please enter a valid LinkedIn URL (e.g. linkedin.com/in/yourname)');
            return;
        }

        setLoading(true);
        try {
            onSubmitUrl(trimmedUrl);
        } catch {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md mx-auto space-y-8 text-center"
        >
            {/* Header / Icon */}
            <div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#0077B5] to-[#0A66C2] rounded-saas-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 shadow-saas-medium ring-1 ring-black/5">
                    in
                </div>
                <h2 className="text-2xl font-semibold text-saas-text-primary tracking-tight">
                    Connect your LinkedIn
                </h2>
                <p className="text-saas-text-secondary text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                    We'll analyze your recent posts to build an AI writer that sounds exactly like you. This typically takes 15-25 seconds.
                </p>
            </div>

            {/* URL Input Area */}
            <div className="text-left space-y-2">
                <Label className="text-xs font-medium text-saas-text-secondary ml-1">
                    LinkedIn Profile URL
                </Label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-saas-text-tertiary group-focus-within:text-saas-text-secondary transition-colors">
                        <LinkIcon className="h-4 w-4" />
                    </div>
                    <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        className="pl-10 h-12 bg-saas-surface border-saas-border text-saas-text-primary placeholder:text-saas-text-tertiary rounded-saas-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus focus-visible:border-saas-border-focus transition-all shadow-saas-subtle"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !url.trim()}
                    className="w-full h-12 bg-gradient-to-b from-saas-brand-dark to-saas-brand hover:from-saas-brand-light hover:to-saas-brand-dark text-white rounded-saas-lg text-sm font-semibold shadow-saas-subtle hover:shadow-saas-glow hover:-translate-y-px transition-all duration-300 border border-white/20 border-b-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/80 border-t-white rounded-full animate-spin" />
                            Starting analysis…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Analyze My Profile <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>
                <button
                    onClick={onSkip}
                    disabled={loading}
                    className="w-full text-center text-xs text-saas-text-tertiary hover:text-saas-text-secondary transition-colors py-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saas-border-focus rounded-md"
                >
                    I don't have a LinkedIn → paste posts manually
                </button>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-3 text-xs text-saas-text-tertiary pt-4 border-t border-saas-border/50">
                <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Read-only
                </span>
                <span className="w-1 h-1 rounded-full bg-saas-border" />
                <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Encrypted
                </span>
                <span className="w-1 h-1 rounded-full bg-saas-border" />
                <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Never posts
                </span>
            </div>
        </motion.div>
    );
}
