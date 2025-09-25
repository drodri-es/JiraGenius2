'use client';

import { useToast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface JiraCredentials {
  url: string;
  email: string;
  token: string;
}

interface JiraConnectionContextType {
  status: ConnectionStatus;
  credentials: JiraCredentials | null;
  connect: (creds: JiraCredentials) => Promise<void>;
  disconnect: () => void;
}

const JiraConnectionContext = createContext<JiraConnectionContextType | undefined>(undefined);

export const JiraConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [credentials, setCredentials] = useState<JiraCredentials | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedCreds = localStorage.getItem('jiraCredentials');
      if (savedCreds) {
        const parsedCreds = JSON.parse(savedCreds);
        connect(parsedCreds);
      }
    } catch (error) {
      console.error('Failed to load Jira credentials from localStorage', error);
      setStatus('disconnected');
    }
  }, []);

  const connect = useCallback(async (creds: JiraCredentials) => {
    setStatus('connecting');
    // Simulate API call to verify credentials
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Always succeed
    setStatus('connected');
    setCredentials(creds);
    try {
      localStorage.setItem('jiraCredentials', JSON.stringify(creds));
    } catch (error) {
      console.error('Failed to save Jira credentials to localStorage', error);
    }
    toast({
      title: 'Connection Successful',
      description: 'Successfully connected to your Jira instance.',
    });
  }, [toast]);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
    setCredentials(null);
    try {
      localStorage.removeItem('jiraCredentials');
    } catch (error) {
      console.error('Failed to remove Jira credentials from localStorage', error);
    }
    toast({
      title: 'Disconnected',
      description: 'You have been disconnected from Jira.',
    });
  }, [toast]);

  return (
    <JiraConnectionContext.Provider value={{ status, credentials, connect, disconnect }}>
      {children}
    </JiraConnectionContext.Provider>
  );
};

export const useJiraConnection = () => {
  const context = useContext(JiraConnectionContext);
  if (context === undefined) {
    throw new Error('useJiraConnection must be used within a JiraConnectionProvider');
  }
  return context;
};
