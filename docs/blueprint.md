# **App Name**: JiraGenius2

## Core Features:

- Jira Connection: Connect to a Jira instance using URL, email, and API token. The app should save credentials and manage connection status (disconnected, connecting, connected, error).
- Dashboard Issue Display: Display a list of Jira issues on the dashboard, fetched using the user's Jira credentials, rendered as a grid of IssueCard components. If disconnected, guide the user to the settings page.
- Issue Details Page: Display detailed information for a selected Jira issue, including title, description, status, priority, and assignee. Includes an AiToolsPanel for AI-powered actions.
- Summarize Issue Description: Use Genkit to create a flow that summarizes long issue descriptions into concise summaries, available in the AiToolsPanel as a tool.
- Suggest Issue Comment: Use Genkit to suggest a relevant comment based on the issue description, available in the AiToolsPanel as a tool.
- Intelligent Issue Routing: Provide an intelligent issue routing tool that suggests the most suitable team and person to assign an issue to based on the issue's description; display a justification for the suggestion, as a tool.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A) for a professional and trustworthy feel.
- Background color: Dark gray (#1F2937) to provide a modern dark theme.
- Accent color: Teal (#008080) to highlight interactive elements.
- Headline font: 'Space Grotesk' (sans-serif) for headlines, providing a modern, computerized aesthetic; body text: 'Inter' (sans-serif).
- Use icons from 'lucide-react' to represent issue types, priorities, and status. Keep icons consistent and visually clear.
- Implement a fixed sidebar navigation (AppSidebar) for primary navigation links: Dashboard, Routing Tool, and Settings. Use ShadCN UI components for a clean and modern interface.
- Use subtle animations for loading states (skeletons) and transitions to enhance user experience without being distracting.