/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { trace } from "@opentelemetry/api";

import { TraceExporter } from "@google-cloud/opentelemetry-cloud-trace-exporter";
import * as http from 'http';

import pkg1 from "@opentelemetry/sdk-trace-node";
const {
  NodeTracerProvider,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  ConsoleSpanExporter
} = pkg1;

import pkg2 from "@opentelemetry/instrumentation-http";
import pkg3 from "@opentelemetry/instrumentation";
import pkg4 from "@opentelemetry/instrumentation-grpc";
const {HttpInstrumentation} = pkg2;
const {registerInstrumentations} = pkg3;
const {GrpcInstrumentation} = pkg4;

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new TraceExporter()));
provider.register();

// Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings.
// You only need to do this if you don't do `provider.register()` above.
// const success = trace.setGlobalTracerProvider(provider);

registerInstrumentations({
  tracerProvider: trace.getTracerProvider(),
  instrumentations: [
    new HttpInstrumentation({
      requestHook: (span, request) => {
        console.log(`HTTP Request: ${request.method}`);
      },
      responseHook: (span, response) => {
        console.log(`HTTP Response: ${response.statusCode}`);
      },
      applyCustomAttributesOnSpan: (span) => {
        span.setAttribute('foo2', 'bar2');
      },
    }),
    //new GrpcInstrumentation(),
  ],
});

console.log("Done initializing Tracing...");

function makeHttpGetRequest() {
  const options = {
    host: 'www.google.com',
    path: '/index.html'
  };
  const req = http.get(options, function(res : any) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    // Buffer the body entirely for processing as a whole.
    const bodyChunks : any[] = [];
    res.on('data', function(chunk : any) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      let body = Buffer.concat(bodyChunks);
      //console.log('BODY: ' + body);
      console.log('BODY: ... length=' + body.length);
    })
  });
  req.on('error', function(e: any) {
    console.log('ERROR: ' + e.message);
  });
}

makeHttpGetRequest();