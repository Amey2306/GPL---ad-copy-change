import { GoogleGenAI, Type } from '@google/genai';
import { AdCopy, UploadSource } from '../types';

// Utility to convert file to a base64 string and format for Gemini API
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // remove the `data:mime/type;base64,` prefix
            resolve(result.split(',')[1]); 
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });

    const base64Data = await base64EncodedDataPromise;

    return {
        inlineData: {
            data: base64Data,
            mimeType: file.type,
        },
    };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCreativeAndCopy = async (imageFile: File, adCopyText: string): Promise<string> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: `Analyze the provided ad creative image and the existing ad copy for Godrej Properties. Provide a concise analysis focusing on key messages, copy-image synergy, and specific areas for improvement.

Existing ad copy:
${adCopyText}` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [imagePart, textPart] }],
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error (analyzeCreativeAndCopy):", error);
        throw new Error('Failed to get analysis from Gemini. The API may be unavailable or the request failed.');
    }
};


export const updateAdCopy = async (analysis: string, originalGoogleAds: AdCopy[], originalMetaAds: AdCopy[]): Promise<{google: AdCopy[], meta: AdCopy[]}> => {
    const prompt = `You are a hyper-precise ad copy editing assistant. Your ONLY task is to identify specific factual changes mentioned in the 'Analysis' and apply them to the 'Original Ad Copy' by performing a surgical "find and replace".

**CRITICAL INSTRUCTIONS:**
1.  **DO NOT REWRITE SENTENCES.** Do not change tone, or rephrase for "better flow".
2.  **ONLY REPLACE SPECIFIC DATA.** Find specific data points in the analysis (e.g., prices, numbers, offer names, dates) and replace ONLY those corresponding data points in the original copy.
3.  **EXAMPLE:** If the analysis states 'Price reduced from 1.19 Cr to 1.10 Cr' and an original headline is 'Homes at ₹1.19 Cr', the updated headline MUST be 'Homes at ₹1.10 Cr'. If the analysis mentions a new 'limited-period pay plan' has replaced a 'rare payment plan', you will find and replace those exact phrases.
4.  If a piece of original copy is not directly affected by a factual change in the analysis, it MUST remain 100% IDENTICAL in the output.
5.  Maintain the exact same JSON structure (same number of fields and same field names) as the original copy.
6.  Strictly adhere to character limits: Google headlines MUST be under 30 characters, descriptions under 90. Edit updated text slightly if it exceeds the limit, but only if absolutely necessary.

**Analysis of New Creative:**
${analysis}

**Original Google Ads (to be updated):**
${JSON.stringify(originalGoogleAds)}

**Original Meta Ads (to be updated):**
${JSON.stringify(originalMetaAds)}

Return ONLY a JSON object with two keys: "google" and "meta", containing the updated arrays of ad copy objects.
`;

    const adCopySchema = {
        type: Type.OBJECT,
        properties: {
            field: { type: Type.STRING },
            text: { type: Type.STRING },
        },
        required: ['field', 'text']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{parts: [{text: prompt}]}],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        google: {
                            type: Type.ARRAY,
                            items: adCopySchema
                        },
                        meta: {
                            type: Type.ARRAY,
                            items: adCopySchema
                        }
                    },
                    required: ['google', 'meta']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error (updateAdCopy):", error);
        if (error instanceof SyntaxError) {
             throw new Error('Gemini returned an invalid format for the ad copy. Please try again.');
        }
        throw new Error('Failed to generate ad copy suggestions. The API may be unavailable.');
    }
};


export const generateAdCopiesFromSource = async (imageFile: File, source: UploadSource): Promise<{ analysis: string, google: AdCopy[], meta: AdCopy[]}> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        let sourceInfo: string;
        let sourcePart: { inlineData: { data: string; mimeType: string; } } | null = null;

        if (source.type === 'file' && source.content instanceof File) {
            sourceInfo = `the provided document named "${source.content.name}"`;
            sourcePart = await fileToGenerativePart(source.content);
        } else if (source.type === 'url') {
            sourceInfo = `the content from the YouTube URL: ${source.content}`;
        } else {
            sourceInfo = `the following text context`;
        }

        const textPrompt = `You are an expert ad copywriter for Godrej Properties, a luxury real estate developer in India. Your task is to generate brand new ad copy for Google Ads and Meta Ads based on the provided creative image and source material.

**Source Material:** Analyze ${sourceInfo}.
${source.type === 'text' ? `\n**Source Text:**\n${source.content}` : ''}

**Task:**
1.  Analyze the creative image and the source material to identify key USPs, offers, and property highlights.
2.  Create compelling ad copy for both Google and Meta platforms.
3.  **Strictly adhere to character limits:** Google headlines MUST be 30 characters or less. Google descriptions MUST be 90 characters or less.
4.  The tone should be professional, aspirational, and persuasive, highlighting luxury and lifestyle benefits.
5.  Structure the output as a JSON object with "analysis", "google", and "meta" keys.
    -   The "analysis" key should contain a concise summary of your findings from the source material.
    -   For Google, provide 3 headlines and 2 descriptions.
    -   For Meta, provide a Primary Text, a Headline, and a Description.

Return ONLY the JSON object.`;

        const parts = [imagePart, { text: textPrompt }];
        if (sourcePart) {
            parts.push(sourcePart);
        }

        const adCopySchema = {
            type: Type.OBJECT,
            properties: {
                field: { type: Type.STRING },
                text: { type: Type.STRING },
            },
            required: ['field', 'text']
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING, description: 'A concise analysis of the source material.' },
                        google: {
                            type: Type.ARRAY,
                            items: adCopySchema
                        },
                        meta: {
                            type: Type.ARRAY,
                            items: adCopySchema
                        }
                    },
                    required: ['analysis', 'google', 'meta']
                },
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Gemini API Error (generateAdCopiesFromSource):", error);
        if (error instanceof SyntaxError) {
             throw new Error('Gemini returned an invalid format while generating new ad copy. Please try again.');
        }
        throw new Error('Failed to generate new ad copy. The API may be unavailable or the source material could not be processed.');
    }
};


export const verifyUrl = async (url: string, analysis: string): Promise<{ verified: boolean, reason: string }> => {
    const prompt = `I need you to act as a verification agent. A new marketing creative has been analyzed for a real estate project. Your task is to check if the website at the provided URL reflects the key information from this analysis.

**Analysis of the New Creative:**
---
${analysis}
---

**Your Task:**
1.  Access the content of the URL: ${url}
2.  Compare the website's content against the key points in the analysis.
3.  Determine if the website has been updated to reflect the new marketing information.
4.  Respond with a JSON object containing two keys: "verified" (a boolean, true if the page is updated, false otherwise) and "reason" (a concise string explaining your finding, e.g., "Verified: The new price and offer are both mentioned on the page." or "Not Verified: The website still shows the old pricing and does not mention the new campaign offer.").

Return ONLY the JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{parts: [{text: prompt}]}],
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(cleanedJsonText);
    } catch (error) {
        console.error(`Gemini API Error (verifyUrl for ${url}):`, error);
        if (error instanceof SyntaxError) {
             throw new Error(`Verification failed: Gemini returned an unexpected response for this URL.`);
        }
        throw new Error(`Verification failed: Could not access or process this URL.`);
    }
};