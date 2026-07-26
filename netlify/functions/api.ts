import serverless from "serverless-http";

import { createServer } from "../../../sih-2025/server/index";

export const handler = serverless(createServer());