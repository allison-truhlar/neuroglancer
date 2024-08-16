/**
 * @license
 * Copyright 2021 Google Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CancellationToken } from "#src/util/cancellation.js";
import { uncancelableToken } from "#src/util/cancellation.js";
import type { ResponseTransform } from "#src/util/http_request.js";
import { cancellableFetchOk } from "#src/util/http_request.js";
import { getS3CompatiblePathCompletions } from "#src/util/s3_bucket_listing.js";

// Support for s3:// special protocol.

export async function cancellableFetchS3Ok<T>(
  bucket: string,
  path: string,
  requestInit: RequestInit,
  transformResponse: ResponseTransform<T>,
  cancellationToken: CancellationToken = uncancelableToken,
) {
  return await cancellableFetchOk(
    `https://${bucket}.s3.amazonaws.com${path}`,
    requestInit,
    transformResponse,
    cancellationToken,
  );
}

export async function getS3PathCompletions(
  bucket: string,
  path: string,
  cancellationToken: CancellationToken,
) {
  console.log("bucket passed to getS3PathCompletions: ", bucket);
  console.log("path passed to getS3PathCompletions: ", path);

  let bucketUrl = `https://${bucket}.s3.amazonaws.com`;
  let enteredBucketUrl = `s3://${bucket}`;

  if (bucket === "https:" || bucket === "http:") {
    const pathParts = path.split("/").filter((part) => part !== "");
    console.log("pathParts: ", pathParts);

    if (pathParts.length <= 2) {
      path = "/";
      bucketUrl = bucket + "//" + pathParts.join("/");
    } else if (pathParts.length >= 3) {
      path = "/" + pathParts.slice(2).join("/") + "/";
      bucketUrl = bucket + "//" + pathParts[0] + "/" + pathParts[1];
    }

    enteredBucketUrl = `s3://${bucketUrl}`;
  }

  return await getS3CompatiblePathCompletions(
    undefined,
    enteredBucketUrl,
    bucketUrl,
    path,
    cancellationToken,
  );
}
