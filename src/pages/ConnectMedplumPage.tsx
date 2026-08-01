// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Anchor, Badge, Button, Code, Group, List, Paper, Stack, Text, Title } from '@mantine/core';
import type { JSX } from 'react';
import { Link } from 'react-router';
import classes from './ConnectedEhrPage.module.css';

export function ConnectMedplumPage(): JSX.Element {
  return (
    <Stack className={classes.page} gap="lg">
      <Paper className={classes.heroPanel}>
        <Group justify="space-between" align="flex-start" gap="lg">
          <Stack gap={8}>
            <Badge className={classes.eyebrow} variant="light">
              Setup
            </Badge>
            <Title className={classes.pageTitle} order={1}>
              Connect Medplum
            </Title>
            <Text className={classes.subtitle}>
              Link this EHR frontend to the Medplum account and project you created.
            </Text>
          </Stack>
          <Badge className={classes.statusBadge} variant="light">
            Browser safe
          </Badge>
        </Group>
      </Paper>

      <Paper className={classes.panelCard}>
        <Stack gap="sm">
          <Title className={classes.panelTitle} order={3}>
            What You Need From Medplum
          </Title>
            <List spacing="xs">
              <List.Item>Your Medplum project in the hosted backend dashboard.</List.Item>
              <List.Item>A ClientApplication resource for this frontend.</List.Item>
              <List.Item>
                This exact URL in the ClientApplication redirect URIs: <Code>https://medi-call-psi.vercel.app</Code>
              </List.Item>
              <List.Item>
                This exact URL in allowed origins, if that field is shown: <Code>https://medi-call-psi.vercel.app</Code>
              </List.Item>
              <List.Item>
                The ClientApplication ID copied into <Code>MEDPLUM_CLIENT_ID</Code>.
              </List.Item>
            </List>
        </Stack>
      </Paper>

      <Paper className={classes.panelCard}>
        <Stack gap="sm">
          <Title className={classes.panelTitle} order={3}>
            Where The Backend Dashboard Is
          </Title>
            <Text className={classes.bodyText}>
              Open <Anchor href="https://app.medplum.com/">app.medplum.com</Anchor>, choose your project, then use the
              left sidebar resources like Patient, Condition, MedicationRequest, Practitioner, Batch, and Project.
            </Text>
            <Text className={classes.bodyText}>
              That is where Medplum stores the real FHIR resources. This React app is just the frontend that can read
              them once auth is configured.
            </Text>
            <Text className={classes.bodyText}>
              After you import the Bundle in Medplum Batch, the Connected EHR page reads Patient, Condition, and
              MedicationRequest resources from that backend.
            </Text>
        </Stack>
      </Paper>

      <Paper className={classes.panelCard}>
        <Stack gap="sm">
          <Title className={classes.panelTitle} order={3}>
            Current State
          </Title>
            <Text>
              Connected to Medplum API base URL: <Code>{import.meta.env.MEDPLUM_BASE_URL}</Code>
            </Text>
            <Text>
              Client ID configured:{' '}
              <Code>{import.meta.env.MEDPLUM_CLIENT_ID ? import.meta.env.MEDPLUM_CLIENT_ID : 'not set yet'}</Code>
            </Text>
        </Stack>
      </Paper>

      <Button component={Link} to="/" w="fit-content" className={classes.primaryButton}>
        Back to EHR
      </Button>
    </Stack>
  );
}
