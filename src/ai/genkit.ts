import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiEndpoint: process.env.GEMINI_API_ENDPOINT,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
