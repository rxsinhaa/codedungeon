'use server';

import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

export type AssistanceType = 'ERROR_CHECK' | 'LOGIC_HINT' | 'FULL_SOLUTION';

export type AssistanceInput = {
    type: AssistanceType;
    questTitle: string;
    questBriefing: string;
    userCode: string;
};

export async function getAiAssistance(input: AssistanceInput): Promise<{ content: string; error?: string }> {
    try {
        let systemPrompt = "You are a wise and mystical Dungeon Master. Your task is to assist a wizard (developer) with their C++ spell (code). Keep the tone immersive (D&D fantasy code dungeon style).";
        let userPrompt = "";

        const { type, questTitle, questBriefing, userCode } = input;

        const baseContext = `
QUEST TITLE: ${questTitle}
QUEST BRIEFING:
${questBriefing}

WIZARD'S CODE:
\`\`\`cpp
${userCode}
\`\`\`
`;

        if (type === 'ERROR_CHECK') {
            userPrompt = `${baseContext}
The wizard is struggling with an error. Analyze the code and identify the likely error or bug.
- Be concise.
- Direct them to the line or logic fault.
- Do NOT rewrite the whole code, just point out the mistake.
- If the code looks correct but might fail edge cases, mention that.
`;
        } else if (type === 'LOGIC_HINT') {
            userPrompt = `${baseContext}
The wizard needs guidance on the logic. 
- Explain the algorithmic logic required to solve the quest.
- Provide 3 distinct hints, numbered 1, 2, 3.
- Do NOT provide the full code solution.
- Focus on the approach.
`;
        } else if (type === 'FULL_SOLUTION') {
            userPrompt = `${baseContext}
The wizard has given up and asks for the ultimate revelation.
- Explain the errors in their current code.
- Explain the correct logic in detail.
- Provide the COMPLETE working C++ solution code.
- Wrap the solution code in a cpp markdown block.
`;
        }

        const response = await openai.chat.completions.create({
            model: "xiaomi/mimo-v2-flash:free", // Using a reliable model for reasoning
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const content = response.choices[0]?.message?.content || "The spirits are silent. Try again later.";
        return { content };

    } catch (error: any) {
        console.error("AI Assistance Error:", error);
        return { content: "", error: "The connection to the ether was severed. " + (error.message || "") };
    }
}
