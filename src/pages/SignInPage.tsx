// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Title } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import { IconSearch } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <SignInForm
      // Configure according to your settings
      googleClientId={import.meta.env.GOOGLE_CLIENT_ID}
      onSuccess={() => navigate('/')?.catch(console.error)}
      clientId={import.meta.env.MEDPLUM_CLIENT_ID}
    >
      <IconSearch size={32} stroke={2} aria-label="Search" />
      <Title>Sign in to Medplum</Title>
    </SignInForm>
  );
}
