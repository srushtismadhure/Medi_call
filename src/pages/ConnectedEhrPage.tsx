// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Alert, Badge, Box, Button, Group, Loader, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import { normalizeErrorString } from '@medplum/core';
import type { Condition, MedicationRequest, Patient } from '@medplum/fhirtypes';
import { useMedplum, useMedplumProfile } from '@medplum/react';
import { IconAlertCircle } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import classes from './ConnectedEhrPage.module.css';

const medplumClientId = import.meta.env.MEDPLUM_CLIENT_ID as string | undefined;

interface LiveEhrData {
  readonly patients: Patient[];
  readonly selectedPatient?: Patient;
  readonly conditions: Condition[];
  readonly medicationRequests: MedicationRequest[];
}

export function ConnectedEhrPage(): JSX.Element {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const [authError, setAuthError] = useState<string>();
  const [authProcessing, setAuthProcessing] = useState(() => new URLSearchParams(window.location.search).has('code'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('code') || profile) {
      return;
    }

    setAuthProcessing(true);
    medplum
      .signInWithRedirect()
      .then(() => {
        window.history.replaceState({}, '', '/');
        setAuthProcessing(false);
      })
      .catch((err: unknown) => {
        setAuthError(normalizeErrorString(err));
        setAuthProcessing(false);
      });
  }, [medplum, profile]);

  if (authProcessing) {
    return (
      <Box className={classes.page}>
        <Group className={classes.loadingPanel}>
          <Loader size="sm" />
          <Text>Connecting to Medplum...</Text>
        </Group>
      </Box>
    );
  }

  if (!profile) {
    return <ConnectPanel authError={authError} />;
  }

  return <LiveEhrDashboard />;
}

function ConnectPanel(props: { readonly authError?: string }): JSX.Element {
  const medplum = useMedplum();
  const [error, setError] = useState<string | undefined>(props.authError);
  const [connecting, setConnecting] = useState(false);

  async function connect(): Promise<void> {
    if (!medplumClientId) {
      setError('MEDPLUM_CLIENT_ID is not configured.');
      return;
    }

    setConnecting(true);
    setError(undefined);
    try {
      await medplum.signInWithRedirect({
        clientId: medplumClientId,
        scope: 'openid profile',
      });
    } catch (err) {
      setError(normalizeErrorString(err));
      setConnecting(false);
    }
  }

  return (
    <Stack className={classes.page} gap="lg">
      <Paper className={classes.heroPanel}>
        <Group justify="space-between" align="flex-start" gap="lg">
          <Stack gap={8}>
            <Badge className={classes.eyebrow} variant="light">
              Hosted Medplum
            </Badge>
            <Title className={classes.pageTitle} order={1}>
              Connected EHR
            </Title>
            <Text className={classes.subtitle}>Connect this frontend to your hosted Medplum backend.</Text>
          </Stack>
          <Badge className={classes.statusBadge} variant="light">
            Ready to connect
          </Badge>
        </Group>
      </Paper>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Could not connect">
          {error}
        </Alert>
      )}

      <Paper className={classes.panelCard}>
        <Stack gap="md">
          <Title className={classes.panelTitle} order={3}>
            How The Two Interfaces Work
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <SummaryItem label="Backend Interface" value="app.medplum.com stores and manages FHIR resources." />
            <SummaryItem label="EHR Frontend" value="This app reads those FHIR resources and displays them as an EHR." />
          </SimpleGrid>
          <Text className={classes.bodyText}>
            To load real data here, first import the synthetic Bundle in Medplum Batch so the backend has Patient,
            Condition, and MedicationRequest resources.
          </Text>
          <Group>
            <Button className={classes.primaryButton} onClick={() => connect()} loading={connecting}>
              Connect to Medplum
            </Button>
            <Button component={Link} to="/demo" variant="light">
              View Static Demo
            </Button>
            <Button component="a" href="https://app.medplum.com/" target="_blank" rel="noreferrer" variant="default">
              Open Backend
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper className={classes.panelCard}>
        <Stack gap="xs">
          <Title className={classes.panelTitle} order={3}>
            Connection Config
          </Title>
          <Text size="sm">
            API endpoint: <strong>{import.meta.env.MEDPLUM_BASE_URL}</strong>
          </Text>
          <Text size="sm">
            Public ClientApplication ID: <strong>{medplumClientId || 'not configured'}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            No client secret is used in this browser frontend.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}

function LiveEhrDashboard(): JSX.Element {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const [data, setData] = useState<LiveEhrData>();
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    async function loadPatients(): Promise<void> {
      setLoading(true);
      setError(undefined);
      try {
        const patients = await medplum.searchResources('Patient', '_count=20&_sort=-_lastUpdated');
        if (!active) {
          return;
        }
        const nextPatient = selectedPatientId
          ? patients.find((patient) => patient.id === selectedPatientId) ?? patients[0]
          : patients[0];
        setSelectedPatientId(nextPatient?.id);
        setData({
          patients,
          selectedPatient: nextPatient,
          conditions: [],
          medicationRequests: [],
        });
      } catch (err) {
        if (active) {
          setError(normalizeErrorString(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPatients().catch(console.error);
    return () => {
      active = false;
    };
  }, [medplum, selectedPatientId]);

  useEffect(() => {
    let active = true;
    const patientId = data?.selectedPatient?.id;
    if (!patientId) {
      return;
    }

    async function loadPatientDetails(): Promise<void> {
      setLoading(true);
      setError(undefined);
      try {
        const patientReference = `Patient/${patientId}`;
        const [conditions, medicationRequests] = await Promise.all([
          medplum.searchResources('Condition', new URLSearchParams({ subject: patientReference, _count: '50' })),
          medplum.searchResources('MedicationRequest', new URLSearchParams({ subject: patientReference, _count: '50' })),
        ]);
        if (active) {
          setData((current) =>
            current
              ? {
                  ...current,
                  conditions,
                  medicationRequests,
                }
              : current
          );
        }
      } catch (err) {
        if (active) {
          setError(normalizeErrorString(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPatientDetails().catch(console.error);
    return () => {
      active = false;
    };
  }, [data?.selectedPatient, medplum]);

  const selectedPatient = data?.selectedPatient;
  const patientReference = selectedPatient?.id ? `Patient/${selectedPatient.id}` : undefined;
  const counts = useMemo(
    () => [
      { label: 'Patients', value: data?.patients.length.toString() ?? '0' },
      { label: 'Conditions', value: data?.conditions.length.toString() ?? '0' },
      { label: 'Medication Requests', value: data?.medicationRequests.length.toString() ?? '0' },
      { label: 'Signed In As', value: profile ? formatProfileName(profile) : 'Unknown' },
    ],
    [data, profile]
  );

  return (
    <Stack className={classes.page} gap="xl">
      <Paper className={classes.heroPanel}>
        <Group justify="space-between" align="flex-start" gap="lg">
          <Stack gap={8}>
            <Badge className={classes.eyebrow} variant="light">
              Live workspace
            </Badge>
            <Title className={classes.pageTitle} order={1}>
              Connected EHR
            </Title>
            <Text className={classes.subtitle}>Live FHIR data from your hosted Medplum backend.</Text>
          </Stack>
          <Group>
            <Button component="a" href="https://app.medplum.com/" target="_blank" rel="noreferrer" variant="default">
              Open Backend
            </Button>
            <Button onClick={() => medplum.signOut().then(() => window.location.reload())} variant="light">
              Sign Out
            </Button>
          </Group>
        </Group>
      </Paper>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Medplum read failed">
          {error}
        </Alert>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {counts.map((item) => (
          <SummaryItem key={item.label} label={item.label} value={item.value} />
        ))}
      </SimpleGrid>

      {loading && (
        <Group className={classes.loadingPanel}>
          <Loader size="sm" />
          <Text>Loading backend data...</Text>
        </Group>
      )}

      {!loading && !selectedPatient && (
        <Paper className={classes.panelCard}>
          <Stack gap="sm">
            <Title className={classes.panelTitle} order={3}>
              No Patients Found
            </Title>
            <Text className={classes.bodyText}>
              Your Medplum project is connected, but the Patient table is empty. Import
              <strong> synthetic-stroke-patient-bundle.json</strong> using Medplum Batch, then refresh this page.
            </Text>
            <Button component="a" href="https://app.medplum.com/Batch" target="_blank" rel="noreferrer" w="fit-content">
              Open Medplum Batch
            </Button>
          </Stack>
        </Paper>
      )}

      {selectedPatient && (
        <>
          <Paper className={classes.panelCard}>
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Title className={classes.panelTitle} order={3}>
                    {formatPatientName(selectedPatient)}
                  </Title>
                  <Text c="dimmed">{patientReference}</Text>
                </Stack>
                <Badge className={classes.statusBadge} variant="light">
                  Live backend data
                </Badge>
              </Group>

              {data && data.patients.length > 1 && (
                <Table.ScrollContainer minWidth={680}>
                  <Table className={classes.dataTable} striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Patient</Table.Th>
                        <Table.Th>Birth Date</Table.Th>
                        <Table.Th>Gender</Table.Th>
                        <Table.Th>Action</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data.patients.map((patient) => (
                        <Table.Tr key={patient.id}>
                          <Table.Td>{formatPatientName(patient)}</Table.Td>
                          <Table.Td>{patient.birthDate}</Table.Td>
                          <Table.Td>{patient.gender}</Table.Td>
                          <Table.Td>
                            <Button size="xs" variant="light" onClick={() => setSelectedPatientId(patient.id)}>
                              View
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <SummaryItem label="Birth Date" value={selectedPatient.birthDate ?? 'Unknown'} />
                <SummaryItem label="Gender" value={selectedPatient.gender ?? 'Unknown'} />
                <SummaryItem label="Language" value={selectedPatient.communication?.[0]?.language?.text ?? 'Unknown'} />
                <SummaryItem label="MRN" value={selectedPatient.identifier?.[0]?.value ?? 'Unknown'} />
              </SimpleGrid>
            </Stack>
          </Paper>

          <ResourceTableSection
            title="Conditions"
            count={data?.conditions.length ?? 0}
            minWidth={680}
            headers={['Condition', 'Clinical Status', 'Recorded', 'Subject']}
            rows={(data?.conditions ?? []).map((condition) => [
              condition.code?.text ?? condition.code?.coding?.[0]?.display ?? 'Unknown',
              condition.clinicalStatus?.coding?.[0]?.display ?? condition.clinicalStatus?.coding?.[0]?.code ?? 'Unknown',
              condition.recordedDate ?? '',
              condition.subject?.reference ?? '',
            ])}
          />

          <ResourceTableSection
            title="Medication Requests"
            count={data?.medicationRequests.length ?? 0}
            minWidth={860}
            headers={['Medication', 'Sig', 'Status', 'RxNorm']}
            rows={(data?.medicationRequests ?? []).map((request) => [
              request.medicationCodeableConcept?.text ??
                request.medicationCodeableConcept?.coding?.[0]?.display ??
                'Unknown',
              request.dosageInstruction?.[0]?.text ?? '',
              request.status ?? '',
              request.medicationCodeableConcept?.coding?.[0]?.code ?? 'Uncoded',
            ])}
            footer="MedicationRequests represent what the EHR says was prescribed; they are not clinical recommendations."
          />
        </>
      )}
    </Stack>
  );
}

function ResourceTableSection(props: {
  readonly title: string;
  readonly count: number;
  readonly minWidth: number;
  readonly headers: string[];
  readonly rows: string[][];
  readonly footer?: string;
}): JSX.Element {
  return (
    <Paper className={classes.panelCard}>
      <Stack gap="md">
        <Group justify="space-between">
          <Title className={classes.panelTitle} order={3}>
            {props.title}
          </Title>
          <Badge className={classes.countBadge} variant="outline">
            {props.count}
          </Badge>
        </Group>
        <Table.ScrollContainer minWidth={props.minWidth}>
          <Table className={classes.dataTable} striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {props.headers.map((header) => (
                  <Table.Th key={header}>{header}</Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {props.rows.map((row, rowIndex) => (
                <Table.Tr key={`${props.title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <Table.Td key={`${props.title}-${rowIndex}-${cellIndex}`}>{cell}</Table.Td>
                  ))}
                </Table.Tr>
              ))}
              {props.rows.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={props.headers.length}>No records found</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {props.footer && (
          <Text size="sm" c="dimmed">
            {props.footer}
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

function SummaryItem(props: { readonly label: string; readonly value: string }): JSX.Element {
  return (
    <Paper className={classes.metricCard}>
      <Text size="xs" c="dimmed" tt="uppercase">
        {props.label}
      </Text>
      <Text fw={700}>{props.value}</Text>
    </Paper>
  );
}

function formatPatientName(patient: Patient): string {
  const name = patient.name?.[0];
  return [...(name?.given ?? []), name?.family].filter(Boolean).join(' ') || 'Unnamed Patient';
}

function formatProfileName(profile: { readonly name?: Patient['name']; readonly id?: string; readonly resourceType?: string }): string {
  const name = profile.name?.[0];
  return [...(name?.given ?? []), name?.family].filter(Boolean).join(' ') || profile.id || profile.resourceType || 'Unknown';
}
