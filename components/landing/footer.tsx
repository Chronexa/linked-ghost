import Link from 'next/link';

export function Footer() {
    return (
        <footer className="w-full bg-[#0F0F12] border-t border-[#1F1F22] text-[#9CA3AF] py-16" aria-label="Site Footer">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-8 lg:gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-6" aria-label="LinkedIn Ghostwriter AI Home">
                            <span className="text-xl font-display font-semibold text-white tracking-tight">
                                LinkedIn Ghostwriter AI
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-6 max-w-xs">
                            Your LinkedIn ghostwriter that sounds like you. Build your personal brand in 3 minutes a day.
                        </p>
                    </div>

                    {/* Use Cases */}
                    <nav aria-label="Use Case Links" className="col-span-1">
                        <h3 className="text-white font-semibold mb-6 text-sm">Use Cases</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/for/founders" className="hover:text-white transition-colors">For Founders</Link></li>
                            <li><Link href="/for/consultants" className="hover:text-white transition-colors">For Consultants</Link></li>
                            <li><Link href="/for/agencies" className="hover:text-white transition-colors">For Agencies</Link></li>
                        </ul>
                    </nav>

                    {/* Features */}
                    <nav aria-label="Feature Links" className="col-span-1">
                        <h3 className="text-white font-semibold mb-6 text-sm">Features</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/features/voice-cloning" className="hover:text-white transition-colors">Voice Cloning</Link></li>
                            <li><Link href="/features/topic-discovery" className="hover:text-white transition-colors">Topic Discovery</Link></li>
                            <li><Link href="/features/post-variants" className="hover:text-white transition-colors">Post Variants</Link></li>
                        </ul>
                    </nav>

                    {/* Resources */}
                    <nav aria-label="Resource Links" className="col-span-1">
                        <h3 className="text-white font-semibold mb-6 text-sm">Resources</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/guides" className="hover:text-white transition-colors">Guides & Blog</Link></li>
                            <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </nav>

                    {/* Company */}
                    <nav aria-label="Company Links" className="col-span-1">
                        <h3 className="text-white font-semibold mb-6 text-sm">Company</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Sign In</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </nav>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} LinkedIn Ghostwriter AI. All rights reserved.</p>
                    <div className="mt-4 md:mt-0">
                        Engineered for LinkedIn Growth
                    </div>
                </div>
            </div>
        </footer>
    );
}
