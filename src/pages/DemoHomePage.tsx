// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge, Group, Paper, SimpleGrid, Stack, Table, Text, Title } from '@mantine/core';
import type { Bundle, Condition, MedicationRequest, Patient, Practitioner, Resource } from '@medplum/fhirtypes';
import { Document } from '@medplum/react';
import type { JSX } from 'react';
import bundleJson from '../../synthetic-stroke-patient-bundle.json';

const bundle = bundleJson as Bundle;
const patientEntry = getEntryResource<Patient>('Patient');
const patientReference = patientEntry.fullUrl;
const patient = patientEntry.resource;
const practitioner = getEntryResource<Practitioner>('Practitioner').resource;
const conditions = getEntryResources<Condition>('Condition');
const medicationRequests = getEntryResources<MedicationRequest>('MedicationRequest');

export function DemoHomePage(): JSX.Element {
  return (
    <Document>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={2}>{formatPatientName(patient)}</Title>
            <Text c="dimmed">Synthetic FHIR R4 patient record</Text>
          </Stack>
          <Badge variant="light" color="blue" size="lg">
            Local demo
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          <SummaryItem label="Birth Date" value={patient.birthDate ?? 'Unknown'} />
          <SummaryItem label="Gender" value={patient.gender ?? 'Unknown'} />
          <SummaryItem label="Language" value={patient.communication?.[0]?.language?.text ?? 'Unknown'} />
          <SummaryItem label="MRN" value={patient.identifier?.[0]?.value ?? 'Unknown'} />
        </SimpleGrid>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Conditions</Title>
              <Badge variant="outline">{conditions.length}</Badge>
            </Group>
            <Table.ScrollContainer minWidth={680}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Condition</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Recorded</Table.Th>
                    <Table.Th>Subject</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {conditions.map((condition, index) => (
                    <Table.Tr key={`${condition.code?.text ?? 'condition'}-${index}`}>
                      <Table.Td>{condition.code?.text}</Table.Td>
                      <Table.Td>{condition.clinicalStatus?.coding?.[0]?.display ?? 'Unknown'}</Table.Td>
                      <Table.Td>{condition.recordedDate}</Table.Td>
                      <Table.Td>{formatReference(condition.subject?.reference)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="sm">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Medication Requests</Title>
              <Badge variant="outline">{medicationRequests.length}</Badge>
            </Group>
            <Table.ScrollContainer minWidth={860}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Medication</Table.Th>
                    <Table.Th>Sig</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>RxNorm</Table.Th>
                    <Table.Th>Requester</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {medicationRequests.map((request, index) => (
                    <Table.Tr key={`${request.medicationCodeableConcept?.text ?? 'medication'}-${index}`}>
                      <Table.Td>{request.medicationCodeableConcept?.text}</Table.Td>
                      <Table.Td>{request.dosageInstruction?.[0]?.text}</Table.Td>
                      <Table.Td>{request.status}</Table.Td>
                      <Table.Td>{request.medicationCodeableConcept?.coding?.[0]?.code ?? 'Uncoded'}</Table.Td>
                      <Table.Td>{formatRequester(request.requester?.reference)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Text size="sm" c="dimmed">
              Synthetic medication-reconciliation fixtures only; not clinical recommendations.
            </Text>
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="sm">
          <Stack gap={4}>
            <Title order={3}>FHIR Bundle</Title>
            <Text size="sm">
              Bundle type: <strong>{bundle.type}</strong>
            </Text>
            <Text size="sm">
              Patient reference before import: <strong>{formatReference(patientReference)}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              After Medplum import, Medplum generates the real Patient ID.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Document>
  );
}

function SummaryItem(props: { readonly label: string; readonly value: string }): JSX.Element {
  return (
    <Paper withBorder p="md" radius="sm">
      <Text size="xs" c="dimmed" tt="uppercase">
        {props.label}
      </Text>
      <Text fw={600}>{props.value}</Text>
    </Paper>
  );
}

function getEntryResource<T extends Resource>(resourceType: T['resourceType']): { fullUrl: string; resource: T } {
  const entry = bundle.entry?.find((item) => item.resource?.resourceType === resourceType);
  if (!entry?.fullUrl || !entry.resource) {
    throw new Error(`Missing ${resourceType} resource in synthetic bundle`);
  }
  return { fullUrl: entry.fullUrl, resource: entry.resource as T };
}

function getEntryResources<T extends Resource>(resourceType: T['resourceType']): T[] {
  return (
    bundle.entry
      ?.map((item) => item.resource)
      .filter((resource): resource is T => resource?.resourceType === resourceType) ?? []
  );
}

function formatPatientName(value: Patient): string {
  const name = value.name?.[0];
  return [...(name?.given ?? []), name?.family].filter(Boolean).join(' ') || 'Unnamed Patient';
}

function formatRequester(reference: string | undefined): string {
  if (reference !== getEntryResource<Practitioner>('Practitioner').fullUrl) {
    return formatReference(reference);
  }
  const name = practitioner.name?.[0];
  return [...(name?.prefix ?? []), ...(name?.given ?? []), name?.family].filter(Boolean).join(' ');
}

function formatReference(reference: string | undefined): string {
  return reference?.replace('urn:uuid:', '') ?? 'Unknown';
}
