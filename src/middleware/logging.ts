import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, headers, body } = req;

  // Log request details
  console.log(`
🔍 Request:
  - Timestamp: ${new Date().toISOString()}
  - Method: ${method}
  - URL: ${url}
  - Headers: ${JSON.stringify(headers)}
  - Body: ${JSON.stringify(body)}
  `);

  // Capture response using response event handlers
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks: Buffer[] = [];

  res.write = function (chunk: Buffer) {
    chunks.push(Buffer.from(chunk));
    return oldWrite.apply(res, arguments as any);
  };

  res.end = function (chunk: Buffer) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    const responseBody = Buffer.concat(chunks).toString('utf8');
    const duration = Date.now() - start;

    // Log response details
    console.log(`
📤 Response:
  - Duration: ${duration}ms
  - Status: ${res.statusCode}
  - Headers: ${JSON.stringify(res.getHeaders())}
  - Body: ${responseBody}
  `);

    oldEnd.apply(res, arguments as any);
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
