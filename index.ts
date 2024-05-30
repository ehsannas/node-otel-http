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

// import {
//   Firestore,
//   Filter,
//   DocumentData,
//   setLogFunction,
//   Settings,
//   CollectionReference,
//   DocumentReference,
//   Query,
//   QuerySnapshot,
//   FieldValue
// } from '@google-cloud/firestore';

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

// This is the main application function. We wrap this program in an asynchronous function to
// avoid errors with top-level awaits.
// async function main(): Promise<void> {
//   // Enable this block to log SDK messages
//   setLogFunction((msg: string) => {
//     console.log(`LogFunction: ${msg}`);
//   });
//   const settings: Settings = {
//     projectId: 'myproject-d5314',
//     preferRest: true,
//     openTelemetryOptions: {
//       enableTracing: true,
//       traceProvider: trace.getTracerProvider()
//     }
//   };
//
//   // Initialize Firestore
//   const firestore = new Firestore(settings);
//
//   await firestore.collection('foo').doc("bar").get();
//
//   /*
//   // Create a collection reference to collection "foo"
//   let myCollection: CollectionReference = firestore.collection('foo');
//
//   // Add a document to the collection
//   let myDocA: DocumentReference<DocumentData> = await myCollection.add({
//     myField: true
//   });
//
//   // Set a document (alternative to add) in the collection
//   let myDocB: DocumentReference<DocumentData> = firestore.doc('foo/B');
//   // the second argument "options" is not required, defaults to merge false
//   await myDocB.set({ myField: false }, { merge: false });
//
//   // Read a document
//   let readDocA = await myDocA.get();
//   */
//
//   /*
//   // Access the data in a specific field
//   console.log(`readDocA.get("myField") --> ${readDocA.get('myField')}`);
//
//   // Access data in all fields using `documentReference.data()`
//   let documentData: any = readDocA.data();
//   console.log(`readDocA.data() --> ${JSON.stringify(documentData)}`);
//
//   // Create a query that filters documents
//   let myQuery: Query<DocumentData> = myCollection.where('myField', '==', true);
//   let queryResults: QuerySnapshot = await myQuery.get();
//   if (!queryResults.empty) {
//     let firstDoc = queryResults.docs[0];
//     // ... do something with firstDoc
//   }
//   */
//
//   /*
//   // Perform an OR query
//   myQuery = myCollection.where(
//     Filter.or(
//       Filter.where('myField', '==', true),
//       Filter.where('myField', '<', 0)
//     )
//   );
//
//   // Update a document
//   await myDocB.update({
//     myField: true,
//     updateTime: FieldValue.serverTimestamp()
//   });
//   */
//
//   /*
//   const tracer = trace.getTracer("foo");
//   // const span1 = tracer.startSpan("span1");
//   // for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {}
//   // span1.end();
//   // const span2 = tracer.startSpan("span2");
//   // for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {}
//   // span2.end();
//   // const span3 = tracer.startSpan("span3");
//   // for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {}
//   // span3.end();
//
//   await tracer.startActiveSpan("main", async span1 => {
//     await tracer.startActiveSpan("read docA", async (span2) => {
//       await myDocA.get();
//       await tracer.startActiveSpan("read docB", async (span3) => {
//         await myDocB.get();
//         span3.end();
//       });
//       span2.end();
//     });
//     span1.end();
//   });
//   await provider.shutdown();
//   */
//   await provider.forceFlush();
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   await firestore.terminate();
// }

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
//main();