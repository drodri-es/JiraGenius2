'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useJiraConnection } from '@/context/JiraConnectionContext';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ShieldQuestion } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
  url: z.string().url({ message: 'Please enter a valid URL.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  token: z.string().min(10, { message: 'API Token must be at least 10 characters.' }),
});

export function JiraConnectionForm() {
  const { status, credentials, connect } = useJiraConnection();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: credentials?.url || '',
      email: credentials?.email || '',
      token: credentials?.token || '',
    },
  });

  useEffect(() => {
    if (credentials) {
      form.reset(credentials);
    }
  }, [credentials, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    connect(values);
  }

  const StatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="mr-2 h-4 w-4" />Connected</Badge>;
      case 'connecting':
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="mr-2 h-4 w-4" />Connection Failed</Badge>;
      default:
        return <Badge variant="outline"><ShieldQuestion className="mr-2 h-4 w-4" />Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Your Credentials</h3>
        <StatusBadge />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jira Instance URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://your-company.atlassian.net" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="you@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Token</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Your Atlassian API Token" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={status === 'connecting'}>
            {status === 'connecting' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : status === 'connected' ? (
              'Reconnect'
            ) : (
              'Connect'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
