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
    return originalSend.call(res, body);
  };

  // Override json
  res.json = function(body: any): Response {
    console.log(`
📤 Response (json):
  - Duration: ${Date.now() - start}ms
  - Status: ${res.statusCode}
  - Body: ${JSON.stringify(body)}
`);
    return originalJson.call(res, body);
  };

  // Override end
  const originalEndFunction = res.end;
  res.end = function(chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void): Response {
    console.log(`
📤 Response (end):
  - Duration: ${Date.now() - start}ms
  - Status: ${res.statusCode}
  - Headers: ${JSON.stringify(res.getHeaders())}
`);

    // Handle the case where encoding is actually the callback
    if (typeof encoding === 'function') {
      return originalEndFunction.call(res, chunk, encoding);
    }

    // Handle the case with all three parameters
    if (callback) {
      return originalEndFunction.call(res, chunk, encoding, callback);
    }

    // Handle the case with just chunk and encoding
    if (encoding) {
      return originalEndFunction.call(res, chunk, encoding);
    }

    // Handle the case with just chunk or no parameters
    return originalEndFunction.call(res, chunk);
  };

  next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`
❌ Error:
  - Timestamp: ${new Date().toISOString()}
  - URL: ${req.url}
  - Error: ${err.message}
  - Stack: ${err.stack}
`);
  next(err);
};
