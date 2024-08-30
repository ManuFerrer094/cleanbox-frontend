import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      getEnvVar('GOOGLE_CLIENT_ID'),
      getEnvVar('GOOGLE_CLIENT_SECRET'),
      getEnvVar('GOOGLE_REDIRECT_URI')
    );

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        getEnvVar('GOOGLE_SCOPE_GMAIL_READONLY'),
        getEnvVar('GOOGLE_SCOPE_GMAIL_MODIFY'),
      ],
    });

    // Redirigir al usuario a la URL de autenticación de Google
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google Auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
}
