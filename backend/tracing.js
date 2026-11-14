/**
 * OpenTelemetry tracing for slow-request investigation. Off unless OTEL_EXPORTER_OTLP_ENDPOINT is set
 * (Honeycomb, Grafana Tempo, Jaeger, SigNoz, an OTel Collector...), so local development pays nothing.
 *
 * Loaded before the app with `node --import ./tracing.js server.js` (see package.json): this is an ES
 * module app, and instrumenting `express` / `mongodb` imports needs the loader hook registered first.
 * Each request becomes a trace with child spans for every MongoDB query and outgoing HTTP call
 * (Groq, Resend, Cloudinary, Unsplash), so a slow endpoint shows exactly where the time went.
 *
 *   OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example.com     (traces are sent to <endpoint>/v1/traces)
 *   OTEL_EXPORTER_OTLP_HEADERS=x-api-key=...                  (optional, read by the exporter)
 *   OTEL_SERVICE_NAME=mountaineer-mallu-api                   (optional)
 *   OTEL_TRACES_SAMPLER=parentbased_traceidratio, OTEL_TRACES_SAMPLER_ARG=0.2   (optional sampling)
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.env') });

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    try {
        const { register } = await import('node:module');
        const { createAddHookMessageChannel } = await import('import-in-the-middle');
        const { registerOptions, waitForAllMessagesAcknowledged } = createAddHookMessageChannel();
        register('import-in-the-middle/hook.mjs', import.meta.url, registerOptions);

        const { NodeSDK } = await import('@opentelemetry/sdk-node');
        const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
        const { HttpInstrumentation } = await import('@opentelemetry/instrumentation-http');
        const { ExpressInstrumentation } = await import('@opentelemetry/instrumentation-express');
        const { MongoDBInstrumentation } = await import('@opentelemetry/instrumentation-mongodb');
        const { Resource } = await import('@opentelemetry/resources');

        const sdk = new NodeSDK({
            resource: new Resource({
                'service.name': process.env.OTEL_SERVICE_NAME || 'mountaineer-mallu-api',
                'deployment.environment': process.env.NODE_ENV || 'development',
            }),
            traceExporter: new OTLPTraceExporter(),
            instrumentations: [
                // Health probes every few seconds would drown the real traffic
                new HttpInstrumentation({ ignoreIncomingRequestHook: req => /^\/(livez|healthz|api\/health)/.test(req.url || '') }),
                new ExpressInstrumentation(),
                new MongoDBInstrumentation({ enhancedDatabaseReporting: false }),
            ],
        });
        sdk.start();
        await waitForAllMessagesAcknowledged();

        const shutdown = () => sdk.shutdown().catch(() => {});
        process.once('SIGTERM', shutdown);
        process.once('SIGINT', shutdown);
        console.log(`🔭 OpenTelemetry tracing enabled → ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`);
    } catch (err) {
        console.warn(`OpenTelemetry not started: ${err.message}`);
    }
}
