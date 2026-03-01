export interface Competitor {
    slug: string;
    name: string;
    type: string;
    shortDescription: string;
    weakness: string;
    ourAdvantage: string;
}

export const competitors: Competitor[] = [
    {
        slug: 'taplio',
        name: 'Taplio',
        type: 'LinkedIn Scheduling Tool',
        shortDescription: 'the popular all-in-one LinkedIn scheduling and analytics platform.',
        weakness: 'Their AI often sounds generic and robotic because it does not learn your specific voice nuances.',
        ourAdvantage: 'Our voice cloning technology ensures you never sound like an AI. We ingest your past posts, learn your sentence structures, and adopt your unique tone before generating any drafts.',
    },
    {
        slug: 'authored-up',
        name: 'AuthoredUp',
        type: 'LinkedIn Formatting Extension',
        shortDescription: 'a great browser extension for formatting and previewing LinkedIn posts.',
        weakness: 'They are primarily a formatting tool and text editor. They do not generate high-quality thought leadership content for you.',
        ourAdvantage: 'We are a full-stack AI ghostwriter. We research trending industry topics, classify them into your pillars, and write compelling first drafts that sound exactly like you.',
    },
    {
        slug: 'supergrow',
        name: 'Supergrow',
        type: 'LinkedIn Growth Tool',
        shortDescription: 'a LinkedIn carousel and content generation tool.',
        weakness: 'Their content templates can feel formulaic, making your posts blend in with thousands of others using the same tool.',
        ourAdvantage: 'Instead of relying on fill-in-the-blank templates, our AI analyzes your exact archetype and writes bespoke thought-leadership from scratch.',
    }
];
