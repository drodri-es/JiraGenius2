'use client';

import { useToast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface JiraCredentials {
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

  const verifyConnection = useCallback(async (creds: JiraCredentials) => {
    try {
      const response = await fetch('/api/jira/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      return response.ok;
    } catch (error) {
      console.error('Verification failed', error);
      return false;
    }
  }, []);

  const connect = useCallback(async (creds: JiraCredentials) => {
    setStatus('connecting');
    setCredentials(creds);
    
    const isValid = await verifyConnection(creds);

    if (isValid) {
      setStatus('connected');
      try {
        localStorage.setItem('jiraCredentials', JSON.stringify(creds));
      } catch (error) {
        console.error('Failed to save Jira credentials to localStorage', error);
      }
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to your Jira instance.',
      });
    } else {
      setStatus('error');
      setCredentials(null);
       try {
        localStorage.removeItem('jiraCredentials');
      } catch (error) {
        console.error('Failed to remove Jira credentials from localStorage', error);
      }
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: 'Could not connect to Jira. Please check your credentials and instance URL.',
      });
    }
  }, [toast, verifyConnection]);

  useEffect(() => {
    try {
      const savedCreds = localStorage.getItem('jiraCredentials');
      if (savedCreds) {
        const parsedCreds = JSON.parse(savedCreds);
        // We re-validate on load
        connect(parsedCreds);
      }
    } catch (error) {
      console.error('Failed to load Jira credentials from localStorage', error);
      setStatus('disconnected');
    }
  }, [connect]);


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
