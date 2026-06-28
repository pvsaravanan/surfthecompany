import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Returns the selected LLM based on environment priority:
 * 1. NVIDIA NIM (nvidia/nemotron-3-nano-30b-a3b)
 * 2. Google Gemini (gemini-1.5-flash)
 * 3. Anthropic Claude (claude-3-7-sonnet-latest) - Default fallback
 */
export function getModel(): any {
  const hasNvidiaKey =
    process.env.NVIDIA_API_KEY &&
    process.env.NVIDIA_API_KEY !== 'your_nvidia_api_key' &&
    process.env.NVIDIA_API_KEY.trim() !== '';

  const hasGeminiKey =
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key' &&
    process.env.GEMINI_API_KEY.trim() !== '';

  if (hasNvidiaKey) {
    const nvidiaProvider = createOpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
    return nvidiaProvider('nvidia/nemotron-3-nano-30b-a3b');
  }

  if (hasGeminiKey) {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    return googleProvider('gemini-1.5-flash');
  }

  return anthropic('claude-3-7-sonnet-latest');
}
