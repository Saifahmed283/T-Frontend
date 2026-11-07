/**
 * Data Subject Request types
 */
export type DataRequestType = 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'withdraw_consent';

export interface DataSubjectRequest {
  id: string;
  type: DataRequestType;
  email: string;
  name?: string;
  details?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  response?: string;
}

export const DATA_REQUEST_TYPES: { value: DataRequestType; label: string; description: string }[] = [
  {
    value: 'access',
    label: 'Access my data',
    description: 'Receive a copy of all personal data we hold about you',
  },
  {
    value: 'rectification',
    label: 'Correct my data',
    description: 'Update inaccurate or incomplete personal data',
  },
  {
    value: 'erasure',
    label: 'Delete my data',
    description: 'Request erasure of your personal data (right to be forgotten)',
  },
  {
    value: 'restriction',
    label: 'Restrict processing',
    description: 'Limit how we process your data while a dispute is resolved',
  },
  {
    value: 'portability',
    label: 'Port my data',
    description: 'Receive your data in a structured, machine-readable format',
  },
  {
    value: 'objection',
    label: 'Object to processing',
    description: 'Object to processing based on legitimate interests or direct marketing',
  },
  {
    value: 'withdraw_consent',
    label: 'Withdraw consent',
    description: 'Withdraw consent for processing that relies on consent',
  },
];

export const DATA_REQUEST_STATUS_LABELS: Record<DataSubjectRequest['status'], string> = {
  pending: 'Pending review',
  in_progress: 'In progress',
  completed: 'Completed',
  rejected: 'Rejected',
};