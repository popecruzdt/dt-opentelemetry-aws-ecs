const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-proto");
const { MeterProvider, PeriodicExportingMetricReader, AggregationTemporality } = require('@opentelemetry/sdk-metrics');

const DT_API_URL = process.env.DT_OTLP_ENDPOINT || EMPTY; // Set DT_API_URL from environment variable
const DT_API_TOKEN = process.env.DT_API_TOKEN || EMPTY; // Set DT_API_TOKEN from envronment variable


// ===== GENERAL SETUP =====

registerInstrumentations({
  instrumentations: [ /* TODO Register your auto-instrumentation libraries here */ ],
});

const fs = require("fs");
let dtmetadata = new Resource({})
for (let name of ['dt_metadata_e617c525669e072eebe3d0f08212e8f2.json', '/var/lib/dynatrace/enrichment/dt_metadata.json', '/var/lib/dynatrace/enrichment/dt_host_metadata.json']) {
  try {
    dtmetadata = dtmetadata.merge(
      new Resource(JSON.parse(fs.readFileSync(name.startsWith("/var") ?
        name : fs.readFileSync(name).toString('utf-8').trim()).toString('utf-8'))));
    break
  } catch { }
}

const resource =
  Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: "js-agent",
      [ATTR_SERVICE_VERSION]: "0.1.0",
    })
  ).merge(dtmetadata);


// ===== TRACING SETUP =====

const provider = new NodeTracerProvider({
    resource: resource,
});

const exporter = new OTLPTraceExporter({
    url: DT_API_URL + '/v1/traces',
    headers: { Authorization: 'Api-Token ' + DT_API_TOKEN }
});

const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();


// ===== METRIC SETUP =====

const metricExporter = new OTLPMetricExporter({
    url: DT_API_URL + '/v1/metrics',
    headers: { Authorization: 'Api-Token ' + DT_API_TOKEN },
    temporalityPreference: AggregationTemporality.DELTA
});

const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 3000
});
const meterProvider = new MeterProvider({ resource: resource });
meterProvider.addMetricReader(metricReader);

// Set this MeterProvider to be global to the app being instrumented.
opentelemetry.metrics.setGlobalMeterProvider(meterProvider);