import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/', '/onboarding/', '/api/', '/admin/'],
        },
        sitemap: 'https://www.linkedinghostwriter-ai.com/sitemap.xml',
    };
}
