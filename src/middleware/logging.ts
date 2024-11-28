import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  console.log(`
🔍 Request:
  - Timestamp: ${new Date().toISOString()}
  - Method: ${req.method}
  - URL: ${req.url}
  - Headers: ${JSON.stringify(req.headers)}
  - Body: ${JSON.stringify(req.body)}
`);

  // Capture original methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;

  // Override send
  res.send = function(body: any): Response {
    console.log(`
📤 Response (send):
  - Duration: ${Date.now() - start}ms
  - Status: ${res.statusCode}
  - Body: ${JSON.stringify(body)}
`);
    return originalSend.apply(res, arguments);
  };

  // Override json
  res.json = function(body: any): Response {
    console.log(`
📤 Response (json):
  - Duration: ${Date.now() - start}ms
  - Status: ${res.statusCode}
  - Body: ${JSON.stringify(body)}
`);
    return originalJson.apply(res, arguments);
  };

  // Override end
  res.end = function(chunk: any, encoding?: string): Response {
    console.log(`
📤 Response (end):
  - Duration: ${Date.now() - start}ms
  - Status: ${res.statusCode}
  - Headers: ${JSON.stringify(res.getHeaders())}
`);
    return originalEnd.apply(res, arguments);
  };

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`
❌ Error:
  - Timestamp: ${new Date().toISOString()}
  - URL: ${req.url}
  - Method: ${req.method}
  - Error: ${err.message}
  - Stack: ${err.stack}
`);
  next(err);
};
