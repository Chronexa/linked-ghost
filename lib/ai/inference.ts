import { openai, DEFAULT_CONFIG } from './openai';

export interface InferredProfileParams {
    role: string;
    industry: string;
    topics: string[];
}

export interface InferredProfileData {
    targetAudience: string;
    uniqueAngle: string;
    pillars: Array<{
        name: string;
        description: string;
    }>;
}

const INFERENCE_SYSTEM_PROMPT = `You are an expert personal branding strategist and executive coach.
Your job is to take minimal information about a professional (their role, industry, and topics they care about)
and infer their optimal positioning strategy on LinkedIn.

Create a specific target audience, a unique angle that differentiates them from generic creators in their space,
and 3 powerful content pillars that they can consistently write about.

Return a JSON object with this EXACT structure:
{
  "targetAudience": "<string, who they should be writing for to maximize impact>",
  "uniqueAngle": "<string, their unique differentiator or perspective>",
  "pillars": [
    {
      "name": "<string, short punchy name for the pillar>",
      "description": "<string, 1-2 sentences explaining what this pillar covers>"
    }
  ]
}

Return ONLY valid JSON. Focus on high-value, sophisticated positioning.`;

const INFERENCE_USER_PROMPT = `Analyze this professional and generate their branding strategy:

Role: {{role}}
Industry: {{industry}}
Topics of Interest: {{topics}}

Generate the JSON response.`;

export async function inferProfileData({ role, industry, topics }: InferredProfileParams): Promise<InferredProfileData> {
    console.log(`🧠 Inferring profile data for: ${role} in ${industry}`);

    const userPrompt = INFERENCE_USER_PROMPT
        .replace('{{role}}', role)
        .replace('{{industry}}', industry)
        .replace('{{topics}}', topics.join(', '));

    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model,
        messages: [
            { role: 'system', content: INFERENCE_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' },
    });

    const completion = response.choices[0].message.content;
    if (!completion) {
        throw new Error('No inference analysis received from OpenAI');
    }

    const parsed = JSON.parse(completion) as InferredProfileData;

    // Validate output structure safely
    return {
        targetAudience: parsed.targetAudience || 'Professionals in ' + industry,
        uniqueAngle: parsed.uniqueAngle || 'Sharing insights from the ' + role + ' perspective',
        pillars: Array.isArray(parsed.pillars) ? parsed.pillars.slice(0, 3) : [],
    };
}
