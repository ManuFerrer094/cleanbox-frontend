"use client";

import EmailItem from './EmailItem';

interface Email {
  id: string;
  subject: string;
  snippet: string;
}

interface EmailListProps {
  emails: Email[];
  onEmailDelete: (emailId: string) => void;
}

export default function EmailList({ emails, onEmailDelete }: EmailListProps) {
  return (
    <ul className="space-y-4">
      {emails.map((email) => (
        <EmailItem key={email.id} email={email} onEmailDelete={onEmailDelete} />
      ))}
    </ul>
  );
}
