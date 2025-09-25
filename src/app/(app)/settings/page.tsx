import { JiraConnectionForm } from './JiraConnectionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-headline font-bold mb-6">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Jira Connection</CardTitle>
            <CardDescription>
              Connect your Jira account to start using the AI tools. You can generate an API token from your Atlassian account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JiraConnectionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
