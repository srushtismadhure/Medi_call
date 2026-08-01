// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Anchor, Button, Code, List, Paper, Stack, Text, Title } from '@mantine/core';
import { Document } from '@medplum/react';
import type { JSX } from 'react';
import { Link } from 'react-router';

export function ConnectMedplumPage(): JSX.Element {
  return (
    <Document>
      <Stack gap="lg">
        <Title order={2}>Connect Medplum</Title>
        <Text>
          The public dashboard is currently using local synthetic data. To connect this frontend to the Medplum account
          you created, the app needs a Medplum ClientApplication from your Medplum project.
        </Text>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="sm">
            <Title order={3}>What You Need From Medplum</Title>
            <List spacing="xs">
              <List.Item>Your Medplum project in the hosted backend dashboard.</List.Item>
              <List.Item>A ClientApplication resource for this frontend.</List.Item>
              <List.Item>
                The frontend app URL added as an allowed redirect/origin: <Code>https://medi-call-psi.vercel.app</Code>
              </List.Item>
              <List.Item>
                The ClientApplication ID copied into <Code>MEDPLUM_CLIENT_ID</Code>.
              </List.Item>
            </List>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="sm">
            <Title order={3}>Where The Backend Dashboard Is</Title>
            <Text>
              Open <Anchor href="https://app.medplum.com/">app.medplum.com</Anchor>, choose your project, then use the
              left sidebar resources like Patient, Condition, MedicationRequest, Practitioner, Batch, and Project.
            </Text>
            <Text>
              That is where Medplum stores the real FHIR resources. This React app is just the frontend that can read
              them once auth is configured.
            </Text>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="sm">
            <Title order={3}>Current State</Title>
            <Text>
              Connected to Medplum API base URL: <Code>{import.meta.env.MEDPLUM_BASE_URL}</Code>
            </Text>
            <Text>
              Client ID configured:{' '}
              <Code>{import.meta.env.MEDPLUM_CLIENT_ID ? import.meta.env.MEDPLUM_CLIENT_ID : 'not set yet'}</Code>
            </Text>
          </Stack>
        </Paper>

        <Button component={Link} to="/" w="fit-content">
          Back to Dashboard
        </Button>
      </Stack>
    </Document>
  );
}
