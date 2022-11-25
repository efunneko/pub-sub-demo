// trace.js - This file contains all the code involving using OpenTelementry within this app

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
//import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';

const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

const exporter = new OTLPTraceExporter({
  url: 'http://dev2-70:9411/api/v2/spans',
 });
 const provider = new WebTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'browser',
  }),
 });

export class Tracer {
  constructor(app) {
    this.app    = app;

     provider.addSpanProcessor(new BatchSpanProcessor(exporter));
     provider.register({
      contextManager: new ZoneContextManager()
     });
     registerInstrumentations({
      instrumentations: [
        new DocumentLoadInstrumentation()
        /*
        getWebAutoInstrumentations({
          // load custom configuration for xml-http-request instrumentation
          '@opentelemetry/instrumentation-xml-http-request': {
            propagateTraceHeaderCorsUrls: [
                /.+/g,
              ],
          },
          // load custom configuration for fetch instrumentation
          '@opentelemetry/instrumentation-fetch': {
            propagateTraceHeaderCorsUrls: [
                /.+/g,
              ],
          },
        }),
        */
      ],
     });

  }
}

