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

  // Override write
  res.write = function(
    chunk: any,
    encoding?: BufferEncoding | (() => void),
    callback?: () => void
  ): boolean {
    if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk, encoding as BufferEncoding));
    }
    return oldWrite.apply(res, arguments as any);
  };

  // Override end
  res.end = function(
    chunk?: any,
    encoding?: BufferEncoding | (() => void),
    callback?: () => void
  ): void {
    if (chunk) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk, encoding as BufferEncoding));
      }
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
