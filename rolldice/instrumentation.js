// instrumentation.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LoggerProvider } = require('@opentelemetry/sdk-logs');
const { logs } = require('@opentelemetry/api-logs');

// Create and configure the log exporter
const logExporterURL = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const logExporter = new OTLPLogExporter({
  url: logExporterURL + '/v1/logs',
});

// Create and configure the logger provider
const otelServiceName = process.env.OTEL_SERVICE_NAME;
const loggerProvider = new LoggerProvider({
  resource: {
    attributes: {
      'service.name': otelServiceName,
    },
  },
  logExporter,
});

// Set the global logger provider
logs.setGlobalLoggerProvider(loggerProvider);

// Initialize the OpenTelemetry Node SDK
/*
const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
*/