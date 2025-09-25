import { config } from 'dotenv';
config();

import '@/ai/flows/intelligent-issue-routing.ts';
import '@/ai/flows/suggest-issue-comment.ts';
import '@/ai/flows/summarize-issue-description.ts';
import '@/ai/flows/cluster-issues.ts';
import '@/ai/flows/classify-issue.ts';
import '@/ai/flows/sprint-capacity-forecasting.ts';
import '@/ai/flows/suggest-issue-tags.ts';
