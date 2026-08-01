// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { AppShell, Box, Group, ScrollArea, Stack, Text, UnstyledButton } from '@mantine/core';
import { ErrorBoundary, Loading } from '@medplum/react';
import {
  IconActivityHeartbeat,
  IconDatabase,
  IconLayoutDashboard,
  IconPlugConnected,
  IconSearch,
} from '@tabler/icons-react';
import { Suspense } from 'react';
import type { JSX } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router';
import { PatientHistory } from './components/PatientHistory';
import { PatientOverview } from './components/PatientOverview';
import { Timeline } from './components/Timeline';
import { ConnectMedplumPage } from './pages/ConnectMedplumPage';
import { ConnectedEhrPage } from './pages/ConnectedEhrPage';
import { DemoHomePage } from './pages/DemoHomePage';
import { PatientPage } from './pages/PatientPage';
import { ResourcePage } from './pages/ResourcePage';
import { ResourceCreatePage } from './pages/ResourceCreatePage';
import classes from './App.module.css';

const links = [
  { icon: IconLayoutDashboard, label: 'Connected EHR', href: '/' },
  { icon: IconActivityHeartbeat, label: 'Static Demo', href: '/demo' },
  { icon: IconPlugConnected, label: 'Connect Medplum', href: '/connect' },
];

export function App(): JSX.Element | null {
  const location = useLocation();

  return (
    <AppShell
      navbar={{ width: 292, breakpoint: 'sm' }}
      padding={0}
      classNames={{
        root: classes.shell,
        navbar: classes.navbar,
        main: classes.main,
      }}
    >
      <AppShell.Navbar>
        <Stack h="100%" gap={0}>
          <Box className={classes.brandBlock}>
            <Group gap="sm" wrap="nowrap">
              <Box className={classes.logoMark}>
                <IconSearch size={23} stroke={2.2} />
              </Box>
              <Box>
                <Text fw={800} size="lg" lh={1.1}>
                  MediCall
                </Text>
                <Text size="xs" c="dimmed">
                  EHR workspace
                </Text>
              </Box>
            </Group>
          </Box>

          <Box className={classes.workspaceCard}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              Project
            </Text>
            <Group gap="xs" mt={8} wrap="nowrap">
              <Box className={classes.projectIcon}>
                <IconDatabase size={18} stroke={2} />
              </Box>
              <Box>
                <Text fw={700} size="sm">
                  Medi_call
                </Text>
                <Text size="xs" c="dimmed">
                  Medplum backend
                </Text>
              </Box>
            </Group>
          </Box>

          <ScrollArea className={classes.navScroll}>
            <Stack gap={6} px="md">
              <Text className={classes.navLabel}>Workspace</Text>
              {links.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === '/'
                    ? location.pathname === '/' || location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.href);
                return (
                  <UnstyledButton
                    key={item.href}
                    component={Link}
                    to={item.href}
                    className={active ? `${classes.navLink} ${classes.activeNavLink}` : classes.navLink}
                  >
                    <Icon size={18} stroke={2} />
                    <span>{item.label}</span>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </ScrollArea>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box className={classes.content}>
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<ConnectedEhrPage />} />
                <Route path="/demo" element={<DemoHomePage />} />
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
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
