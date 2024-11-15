/*instrumentation.js*/
// Require dependencies
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

// Additional dependencies
const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");

// Environment Variables
const OTEL_EXPORTER_OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || null; // Set DT_API_URL from environment variable

// ===== TRACING SETUP =====

let exporter;

if(OTEL_EXPORTER_OTLP_ENDPOINT === null) {
    exporter = new ConsoleSpanExporter();
    console.log("Environment variable 'OTEL_EXPORTER_OTLP_ENDPOINT' is 'null', switching to ConsoleSpanExporter");
} else {
    exporter = new OTLPTraceExporter({
        url: OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
    });
}

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk
  .start()
