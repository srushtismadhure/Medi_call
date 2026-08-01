// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AppShell, ErrorBoundary, Loading } from '@medplum/react';
import { IconLayoutDashboard, IconPlugConnected, IconSearch } from '@tabler/icons-react';
import { Suspense } from 'react';
import type { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { PatientHistory } from './components/PatientHistory';
import { PatientOverview } from './components/PatientOverview';
import { Timeline } from './components/Timeline';
import { ConnectMedplumPage } from './pages/ConnectMedplumPage';
import { DemoHomePage } from './pages/DemoHomePage';
import { PatientPage } from './pages/PatientPage';
import { ResourcePage } from './pages/ResourcePage';
import { ResourceCreatePage } from './pages/ResourceCreatePage';

export function App(): JSX.Element | null {
  return (
    <AppShell
      logo={<IconSearch size={24} stroke={2} aria-label="Search" />}
      menus={[
        {
          title: 'My Links',
          links: [
            { icon: <IconLayoutDashboard />, label: 'Dashboard', href: '/' },
            { icon: <IconPlugConnected />, label: 'Connect Medplum', href: '/connect' },
          ],
        },
      ]}
    >
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<DemoHomePage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/connect" element={<ConnectMedplumPage />} />
            <Route path="/medplum" element={<Navigate to="/" replace />} />
            <Route path="/signin" element={<Navigate to="/" replace />} />
            <Route path="/reset-password" element={<Navigate to="/" replace />} />
            <Route path="/Patient/new" element={<ResourceCreatePage />} />
            <Route path="/Patient/:id" element={<PatientPage />}>
              <Route index element={<PatientOverview />} />
              <Route path="overview" element={<PatientOverview />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="history" element={<PatientHistory />} />
            </Route>
            <Route path="/:resourceType/:id" element={<ResourcePage />} />
            <Route path="/:resourceType/:id/_history/:versionId" element={<ResourcePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
