// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { ResetPasswordForm } from '@medplum/react';
import type { JSX } from 'react';
import { useNavigate } from 'react-router';

export function ResetPasswordPage(): JSX.Element {
  const navigate = useNavigate();
  return <ResetPasswordForm onSignIn={() => navigate('/signin')} onSuccess={() => navigate('/signin')} />;
}
