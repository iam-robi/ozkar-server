import { ProofRequest } from '../activities';

export const exampleProofRequest: ProofRequest = {
  query: {
    '/resourceType': {
      $eq: 'Observation',
    },
    '/status': {
      $eq: 'final',
    },
    '/code/coding/0/system': {
      $eq: 'http://loinc.org',
    },
    '/code/coding/0/code': {
      $eq: '29463-7',
    },
    '/valueQuantity/unit': {
      $eq: 'kg',
    },
    '/valueQuantity/value': {
      $eq: '75',
    },
  },
  resource: {
    resourceType: 'Observation',
    id: 'weight',
    meta: {
      profile: ['http://hl7.org/fhir/us/vitals/StructureDefinition/body-weight'],
    },
    text: {
      status: 'extensions',
      div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyWeight-example"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyWeight-example&quot; </p><p style="margin-bottom: 0px">Profile: <a href="StructureDefinition-body-weight.html">Body Weight</a></p></div><p><b>Device Code</b>: Floor scale, electronic <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#469204003)</span></p><p><b>Associated Situation</b>: Undressed <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#248160001)</span></p><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.0.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: Body weight <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#29463-7)</span></p><p><b>subject</b>: <span>: Small Child1234</span></p><p><b>encounter</b>: <span>: GP Visit</span></p><p><b>effective</b>: 2019-10-16 12:12:29-0900</p><p><b>value</b>: 25 kg<span style="background: LightGoldenRodYellow"> (Details: UCUM code kg = \'kg\')</span></p></div>',
    },
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/observation-deviceCode',
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '469204003',
              display: 'Floor scale, electronic',
            },
          ],
        },
      },
      {
        url: 'http://hl7.org/fhir/us/vitals/StructureDefinition/AssociatedSituationExt',
        valueCodeableConcept: {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '248160001',
              display: 'Undressed',
            },
          ],
        },
      },
    ],
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
        text: 'Vital Signs',
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '29463-7',
        },
      ],
      text: 'Body weight',
    },
    subject: {
      display: 'Small Child1234',
    },
    encounter: {
      display: 'GP Visit',
    },
    effectiveDateTime: '2019-10-16T12:12:29-09:00',
    valueQuantity: {
      value: 75,
      unit: 'kg',
      system: 'http://unitsofmeasure.org',
      code: 'kg',
    },
  },
};
