import { openai, DEFAULT_CONFIG } from './openai';
import { z } from 'zod';

export async function rewriteDraft(draftText: string, instruction: string): Promise<string> {
    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model,
        messages: [
            {
                role: 'system',
                content: `You are an expert LinkedIn ghostwriter. Rewrite the following draft according to the user's instructions. 
Maintain the original tone and style, but apply the requested changes perfectly. 
IMPORTANT: Return ONLY the rewritten text without markdown formatting blocks like \`\`\` text \`\`\`. Do not include conversational filler.`
            },
            {
                role: 'user',
                content: `Current Draft:\n${draftText}\n\nInstruction: ${instruction}\n\nRewritten Draft:`
            }
        ],
        temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || draftText;
}

export async function regenerateHooks(draftText: string): Promise<string[]> {
    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model,
        messages: [
            {
                role: 'system',
                content: `You are an expert LinkedIn copywriter. The user will provide a LinkedIn post. 
Your job is to read the post (ignoring its current hook/opening line) and write 3 brand NEW, highly engaging hooks (first 1-2 sentences) for it. 
Provide one Contrarian hook, one Story-driven hook, and one Data-driven or Direct hook. 
Return pure JSON with a "hooks" array of strings.`
            },
            {
                role: 'user',
                content: `Post:\n${draftText}`
            }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
    });

    try {
        const parsed = JSON.parse(response.choices[0]?.message?.content || '{"hooks": []}');
        return parsed.hooks || [];
    } catch (e) {
        console.error('Failed to parse hooks JSON', e);
        return [];
    }
}
