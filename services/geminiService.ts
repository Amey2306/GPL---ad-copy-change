import { GoogleGenAI, Part, Type } from "@google/genai";
import { AdCopy, Project } from "../types";

// According to guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to a Gemini Part
async function fileToGenerativePart(file: File): Promise<Part> {
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
}

export const analyzeCreatives = async (
    project: Project,
    creativeFiles: File[],
    googleAds?: AdCopy[],
    metaAds?: AdCopy[],
): Promise<string> => {
    const imageParts = await Promise.all(creativeFiles.map(fileToGenerativePart));

    let prompt = `Analyze the following ad creative(s) for the Godrej Properties project: "${project.name}" located in ${project.location}, ${project.city}.

    **Project Details:**
    - Name: ${project.name}
    - Location: ${project.location}, ${project.city}

    **Analysis Task:**
    1.  **Visual Analysis:** Describe the key visual elements, mood, and target audience suggested by the image(s).
    2.  **Copy Analysis (if provided):** Review the existing ad copy for Google and Meta. Assess its alignment with the visuals, brand voice, and project details. Identify strengths and weaknesses.
    3.  **Key Selling Points:** Based on the visuals and project context, identify the top 3-5 unique selling propositions (USPs) that should be highlighted.
    4.  **Recommendations:** Provide actionable recommendations for improving the ad copy to maximize engagement and conversion. Focus on clarity, emotional appeal, and a strong call-to-action.

    Format your response in clear, concise markdown. Use bold headings for each section.
    `;

    if (googleAds && googleAds.length > 0) {
        prompt += '\n\n**Existing Google Ads Copy:**\n';
        prompt += googleAds.map(ad => `- ${ad.field}: ${ad.text}`).join('\n');
    }
    if (metaAds && metaAds.length > 0) {
        prompt += '\n\n**Existing Meta Ads Copy:**\n';
        prompt += metaAds.map(ad => `- ${ad.field}: ${ad.text}`).join('\n');
    }

    const contents = { parts: [...imageParts, { text: prompt }] };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
    });

    return response.text;
};


const adCopyResponseSchema = {
    type: Type.OBJECT,
    properties: {
        googleAds: {
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
        metaAds: {
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
    required: ['googleAds', 'metaAds'],
};


export const generateAdCopy = async (
    project: Project,
    analysis: string,
): Promise<{ googleAds: AdCopy[], metaAds: AdCopy[] }> => {
    
    const prompt = `Based on the following project information and creative analysis, generate compelling ad copy for Google Ads and Meta Ads.

    **Project Information:**
    - Project Name: ${project.name}
    - Location: ${project.location}, ${project.city}

    **Creative Analysis & Recommendations:**
    ${analysis}

    **Task:**
    Generate ad copy that is engaging, on-brand for Godrej Properties (premium, trustworthy, aspirational), and tailored to each platform's best practices.

    **Output Structure & Rules:**
    1.  Provide your response as a single, valid JSON object matching the provided schema.
    2.  For **Google Ads**, provide text for the fields: "Headline 1", "Headline 2", "Headline 3", "Description 1", "Description 2". Adhere to character limits (30 for headlines, 90 for descriptions).
    3.  For **Meta Ads**, provide text for the fields: "Primary Text", "Headline", and "Description". Adhere to character limits (40 for headline, 30 for description). The Primary Text can be longer.
    4.  Ensure you provide distinct, appropriate content for Meta and do not just reuse the Google Ads structure.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: adCopyResponseSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(e) {
        console.error("Failed to parse JSON from Gemini for ad copy generation:", response.text);
        throw new Error("Received invalid JSON from the API.");
    }
};

export const updateAdCopy = async (
    project: Project,
    analysis: string,
    originalGoogleAds: AdCopy[],
    originalMetaAds: AdCopy[],
): Promise<{ googleAds: AdCopy[], metaAds: AdCopy[] }> => {

    const prompt = `Based on the following project information, creative analysis, and original ad copy, provide updated and improved ad copy for Google Ads and Meta Ads.

    **Project Information:**
    - Project Name: ${project.name}
    - Location: ${project.location}, ${project.city}

    **Creative Analysis & Recommendations:**
    ${analysis}

    **Original Google Ads Copy:**
    ${originalGoogleAds.map(ad => `- ${ad.field}: ${ad.text}`).join('\n')}

    **Original Meta Ads Copy:**
    ${originalMetaAds.map(ad => `- ${ad.field}: ${ad.text}`).join('\n')}

    **Task:**
    Revise the original ad copy based on the recommendations in the analysis. Your primary goal is to perform a surgical update, only changing facts or phrases mentioned in the analysis. Preserve the original brand voice and structure as much as possible.

    **Output Structure & Rules:**
    1.  Provide your response as a single, valid JSON object.
    2.  For **Google Ads**, provide updated text for the fields: "Headline 1", "Headline 2", "Headline 3", "Description 1", "Description 2". Adhere to character limits (30 for headlines, 90 for descriptions).
    3.  For **Meta Ads**, provide updated text for the fields: "Primary Text", "Headline", and "Description". Adhere to character limits (40 for headline, 30 for description). The Primary Text can be longer. Ensure you provide distinct, appropriate content for Meta and do not just reuse the Google Ads structure.

    Output the result as a single JSON object with the updated copy, matching the provided schema.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: adCopyResponseSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch(e) {
        console.error("Failed to parse JSON from Gemini for ad copy update:", response.text);
        throw new Error("Received invalid JSON from the API.");
    }
};

export const verifyUrl = async (
    url: string,
    analysis: string,
): Promise<{ verified: boolean; reason: string; error?: boolean }> => {
    
    const prompt = `You are a content verifier. Your task is to check if a live webpage reflects the key points from a creative analysis.

    **Creative Analysis Summary:**
    ${analysis}

    **Webpage to Verify:**
    ${url}

    **Verification Task:**
    1. Access the content of the provided URL.
    2. Compare the webpage's content against the **Creative Analysis Summary**.
    3. Determine if the key selling points, tone, and offers from the analysis are present and accurately represented on the webpage.
    4. On the first line, respond with only one word: "VERIFIED" or "UNVERIFIED".
    5. On the second line, provide a brief, one-sentence explanation for your decision.

    Example response for a verified case:
    VERIFIED
    The page correctly highlights the sea views and spacious 3 BHK configurations.
    
    Example response for an unverified case:
    UNVERIFIED
    The key selling point about world-class amenities is not mentioned on the page.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const text = response.text;
        const lines = text.trim().split('\n');
        if (lines.length < 1) {
            return { verified: false, reason: 'Could not determine verification status from API response.', error: true };
        }
        const status = lines[0].trim().toUpperCase();
        const reason = lines.slice(1).join(' ').trim();
        
        return {
            verified: status === 'VERIFIED',
            reason: reason || (status === 'VERIFIED' ? 'Content aligns with analysis.' : 'Content does not align with analysis.'),
        };

    } catch (e) {
        console.error("Error verifying URL:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        return { verified: false, reason: `API Error: ${errorMessage}`, error: true };
    }
};
