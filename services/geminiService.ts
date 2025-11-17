import { GoogleGenAI, Type } from "@google/genai";
import { AdCopy, Project, VerificationResult } from '../types';

// FIX: Initialize the Gemini AI client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

/**
 * Converts a File object to a GoogleGenerativeAI.Part object.
 * @param file The file to convert.
 * @returns A promise that resolves to a Part object.
 */
const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: base64EncodedData,
            mimeType: file.type,
        },
    };
};

// FIX: Define the response schema for ad copy generation/analysis.
const adCopySchema = {
    type: Type.OBJECT,
    properties: {
        analysis: { type: Type.STRING },
        updatedGoogleCopy: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    field: { type: Type.STRING },
                    text: { type: Type.STRING },
                },
                required: ['field', 'text'],
            },
        },
        updatedMetaCopy: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    field: { type: Type.STRING },
                    text: { type: Type.STRING },
                },
                required: ['field', 'text'],
            },
        },
    },
    required: ['analysis', 'updatedGoogleCopy', 'updatedMetaCopy'],
};


/**
 * Analyzes new creatives against existing ad copy.
 * @param creativeFiles - The new image files.
 * @param googleAds - Existing Google Ads copy.
 * @param metaAds - Existing Meta Ads copy.
 * @param project - The project details.
 * @returns An object containing the analysis and updated ad copy.
 */
export const analyzeAdCopy = async (
    creativeFiles: File[],
    googleAds: AdCopy[],
    metaAds: AdCopy[],
    project: Project
): Promise<{ analysis: string; updatedGoogleCopy: AdCopy[]; updatedMetaCopy: AdCopy[] }> => {
    
    const imageParts = await Promise.all(creativeFiles.map(fileToGenerativePart));

    const prompt = `You are an expert digital marketing strategist for Godrej Properties, a luxury real estate developer.
Your task is to analyze new ad creatives and suggest updates to existing Google Ads and Meta Ads copy to align with the new visual assets.

**Project Details:**
- Project Name: ${project.name}
- Location: ${project.location}, ${project.city}
- Key Links: ${JSON.stringify(project.links, null, 2)}

**Existing Google Ads Copy:**
${JSON.stringify(googleAds, null, 2)}

**Existing Meta Ads Copy:**
${JSON.stringify(metaAds, null, 2)}

**Instructions:**
1.  **Analyze the new creative(s) provided.** Identify the key themes, selling points, and visual elements (e.g., amenities, lifestyle, architecture, specific offers).
2.  **Critique the existing ad copy.** Assess how well it complements the new creative(s). Identify gaps or misalignments.
3.  **Provide a concise analysis.** Summarize your findings in a brief report (3-4 bullet points).
4.  **Suggest updated ad copy.** Rewrite the Google Ads and Meta Ads copy to be more effective with the new creative(s). Maintain the original structure (field names) for both platforms. Ensure the copy is compelling, brand-aligned, and drives action.
5.  **IMPORTANT: For Google Ads, you MUST adhere to strict character limits: each Headline must be 30 characters or less, and each Description must be 90 characters or less.**

Return a single JSON object with the specified schema.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [...imageParts, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: adCopySchema,
        }
    });

    return JSON.parse(response.text);
};

/**
 * Generates new ad copy from creatives.
 * @param creativeFiles - The new image/pdf files.
 * @param youtubeUrls - The YouTube video URLs.
 * @param project - The project details.
 * @returns An object containing the analysis and new ad copy.
 */
export const generateAdCopy = async (
    creativeFiles: File[],
    youtubeUrls: string[],
    project: Project
): Promise<{ analysis: string; updatedGoogleCopy: AdCopy[]; updatedMetaCopy: AdCopy[] }> => {

    const imageParts = await Promise.all(creativeFiles.map(fileToGenerativePart));

    const youtubePrompt = youtubeUrls.length > 0 
        ? `\n**Source YouTube URLs for additional context:**\n${youtubeUrls.map(url => `- ${url}`).join('\n')}` 
        : '';

    const prompt = `You are an expert digital marketing copywriter for Godrej Properties, a luxury real estate developer.
Your task is to generate new Google Ads and Meta Ads copy based on the provided ad creatives, source materials, and project details. You MUST use Google Search to gather the most up-to-date information.

**Project Details:**
- Project Name: ${project.name}
- Location: ${project.location}, ${project.city}
- Key Links: ${JSON.stringify(project.links, null, 2)}${youtubePrompt}

**Instructions:**
1.  **Use Google Search.** Find the latest information about "${project.name}", its surrounding area in "${project.location}, ${project.city}" (e.g., new infrastructure, lifestyle benefits, local attractions), and competitor messaging for similar luxury properties.
2.  **Analyze all provided source material.** This includes images, PDFs, and content from any YouTube URLs, in addition to your search findings. Identify the key themes, selling points, and unique value propositions.
3.  **Write a brief creative analysis.** Based on all source materials and your search, explain the strategy behind the copy you are about to write (2-3 bullet points).
4.  **Generate complete ad copy for Google Ads.** Provide copy for the following fields: Headline 1, Headline 2, Headline 3, Description 1, Description 2.
5.  **IMPORTANT: For Google Ads, you MUST adhere to strict character limits: each Headline must be 30 characters or less, and each Description must be 90 characters or less.**
6.  **Generate complete ad copy for Meta Ads.** Provide copy for the following fields: Primary Text, Headline, Description.
7.  **Ensure the copy is powerful, impactful, and data-driven.** Use a sophisticated, aspirational tone that reflects the latest information and stands out from competitors.

Return ONLY a single, valid JSON object with the following structure: { "analysis": string, "updatedGoogleCopy": [{ "field": string, "text": string }], "updatedMetaCopy": [{ "field": string, "text": string }] }. Do not include any other text or markdown formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [...imageParts, { text: prompt }] },
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let text = response.text;
        const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            text = markdownMatch[1];
        }
        const jsonObjectMatch = text.match(/{[\s\S]*}/);
        if (jsonObjectMatch && jsonObjectMatch[0]) {
            return JSON.parse(jsonObjectMatch[0]);
        }
        throw new Error('Could not parse JSON from the model response for ad copy generation.');

    } catch (error) {
        console.error("Error during ad copy generation:", error);
        throw new Error("Failed to generate ad copy. The model returned an unexpected response.");
    }
};


/**
 * Verifies if a URL's content aligns with an analysis summary.
 * @param url - The URL to verify.
 * @param analysis - The analysis of expected changes.
 * @returns A VerificationResult object.
 */
export const verifyUrl = async (url: string, analysis: string): Promise<Omit<VerificationResult, 'url' | 'name'>> => {
    
    const prompt = `You are a quality assurance agent. Your task is to verify if a webpage's content aligns with a given analysis summary.
Use the provided web search results for the URL to make your determination.

**URL to check:** ${url}

**Analysis of expected changes:**
"${analysis}"

**Instructions:**
1.  Based on the content of the URL from the search results, determine if the key points from the "Analysis of expected changes" are reflected on the page.
2.  Provide a "Yes" or "No" answer for the 'verified' field.
3.  Provide a concise, one-sentence reason for your answer. If the changes are not reflected, explain what is missing.

Return ONLY a single, valid JSON object with the following structure: { "verified": boolean, "reason": string }. Do not include any other text or markdown formatting.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        // The response text might contain markdown and other text. We need to extract the JSON object.
        let text = response.text;
        
        // First, try to find a JSON block inside markdown
        const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            text = markdownMatch[1];
        }

        // Then, find the JSON object within the potentially cleaned text
        const jsonObjectMatch = text.match(/{[\s\S]*}/);

        if (jsonObjectMatch && jsonObjectMatch[0]) {
            const result = JSON.parse(jsonObjectMatch[0]);
            return {
                verified: result.verified,
                reason: result.reason,
                error: false,
            };
        }
        
        // If no JSON object is found, throw an error.
        throw new Error('Could not parse JSON from the model response.');

    } catch (error: any) {
        console.error(`Error verifying URL ${url}:`, error);
        return {
            verified: false,
            reason: error.message || 'An error occurred during verification.',
            error: true,
        };
    }
};