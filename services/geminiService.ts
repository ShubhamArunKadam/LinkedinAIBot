
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function detectTrend(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'What is one of the most viral, post-worthy, and trending topics in the AI space right now? Only provide the topic name or concept, nothing else. For example: "AI Agents taking over software development". Be specific and concise.',
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error detecting trend:", error);
    throw new Error("Could not connect to Gemini API to detect trends.");
  }
}

export async function generatePost(trend: string): Promise<string> {
  const prompt = `
    Create a storytelling-style LinkedIn post about the trend: "${trend}".
    The post must be in the style of "shubhztechwork", which means it should be inspired by a movie, series, or a relatable real-life story.
    
    Style requirements:
    1.  **Relatable Narrative:** Start with a hook that draws the reader in, using a story from a popular movie, TV show, or a common life experience.
    2.  **Connect to AI Trend:** Smoothly transition from the story to the AI trend: "${trend}".
    3.  **Clear Takeaway:** Provide a clear insight or takeaway for the reader about the significance of this trend.
    4.  **Formatting:** Use short paragraphs, bullet points, or emojis to make it easy to read.
    5.  **CTA:** Include an optional, non-salesy call-to-action at the end, like "What are your thoughts?" or "What movie does this remind you of?".
    6.  **Hashtags:** Include 3-5 relevant hashtags at the end.
    
    Generate the post text now.
    `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating post:", error);
    throw new Error("Could not connect to Gemini API to generate the post.");
  }
}

export async function generateImage(postContent: string): Promise<string> {
  try {
    // First, generate a powerful image prompt from the post content.
    const imagePromptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following LinkedIn post, create a short, descriptive prompt for an AI image generator like Midjourney or DALL-E. The prompt should capture the core theme in a "movie-poster" style, with a futuristic or dramatic storytelling angle. The prompt should be a single sentence.
        
        Post: "${postContent}"
        
        Image Prompt:`,
    });
    const imagePrompt = imagePromptResponse.text.trim();

    // Now, generate the image using the created prompt.
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
      const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Could not connect to Gemini API to generate the image.");
  }
}
