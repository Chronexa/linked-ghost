import { MetadataRoute } from 'next';
import { competitors } from '@/lib/seo/competitors';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.linkedinghostwriter-ai.com';

    // Core Pages
    const routes = [
        '',
        '/pricing',
        '/sign-up',
        '/sign-in',
        '/legal/privacy',
        '/legal/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Personas
    const personas = ['founders', 'agencies', 'consultants'].map((persona) => ({
        url: `${baseUrl}/for/${persona}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.9,
    }));

    // Features
    const features = ['post-variants', 'topic-discovery', 'voice-cloning'].map((feature) => ({
        url: `${baseUrl}/features/${feature}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Guides
    const guides = [
        'ai-for-linkedin-voice',
        'b2b-social-selling',
        'finding-your-content-pillars',
        'linkedin-algorithm-2026',
    ].map((guide) => ({
        url: `${baseUrl}/guides/${guide}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Competitors (Programmatic SEO)
    const alternatives = competitors.map((c) => ({
        url: `${baseUrl}/alternatives/${c.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...routes, ...personas, ...features, ...guides, ...alternatives];
}
