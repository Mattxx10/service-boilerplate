import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';
import fp from 'fastify-plugin';
import { UnauthorizedError } from '../shared/errors';

const BFF_SECRET = process.env.BFF_SERVICE_SECRET;

if (!BFF_SECRET) {
  throw new Error('BFF_SERVICE_SECRET environment variable is required');
}

interface BFFAuthHeaders {
  userId: string;
  organizationId?: string;
  timestamp: string;
  signature: string;
}

/**
 * Extract BFF authentication headers from request
 */
function extractBFFHeaders(request: FastifyRequest): BFFAuthHeaders | null {
  const userId = request.headers['x-user-id'] as string;
  const organizationId = request.headers['x-organization-id'] as string | undefined;
  const timestamp = request.headers['x-timestamp'] as string;
  const signature = request.headers['x-signature'] as string;

  if (!userId || !timestamp || !signature) {
    return null;
  }

  return { userId, organizationId, timestamp, signature };
}

/**
 * Verify BFF signature and timestamp
 */
function verifyBFFSignature(headers: BFFAuthHeaders): boolean {
  // Check timestamp to prevent replay attacks (5 minute window)
  const now = Date.now();
  const requestTime = parseInt(headers.timestamp, 10);

  if (isNaN(requestTime)) {
    return false;
  }

  // Check if request is too old (more than 5 minutes)
  if (now - requestTime > 5 * 60 * 1000) {
    return false;
  }

  // Check if timestamp is in the future (allow 1 minute clock skew)
  if (requestTime > now + 60 * 1000) {
    return false;
  }

  // Recreate signature
  const payload = `${headers.userId}:${headers.organizationId || ''}:${headers.timestamp}`;
  const expectedSignature = createHmac('sha256', BFF_SECRET!)
    .update(payload)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(headers.signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

// Extend Fastify request with BFF authenticated user data
declare module 'fastify' {
  interface FastifyRequest {
    bffAuth: {
      userId: string;
      organizationId?: string;
    } | null;
  }
}

/**
 * BFF Authentication Plugin
 * Verifies signed headers from Next.js BFF with HMAC-SHA256
 * 
 * Security features:
 * - HMAC-SHA256 signature verification
 * - Replay attack protection via timestamp validation
 * - Timing-safe signature comparison
 */
const bffAuthPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('bffAuth', null);

  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const headers = extractBFFHeaders(request);

    if (!headers) {
      // No BFF headers present - this will be caught by requireAuth guard if needed
      request.bffAuth = null;
      return;
    }

    if (!verifyBFFSignature(headers)) {
      fastify.log.warn(
        {
          userId: headers.userId,
          organizationId: headers.organizationId,
          timestamp: headers.timestamp,
          ip: request.ip,
          path: request.url,
        },
        'BFF authentication failed: Invalid signature or timestamp'
      );

      throw new UnauthorizedError('Invalid BFF signature or timestamp');
    }

    // Attach authenticated user data to request
    request.bffAuth = {
      userId: headers.userId,
      organizationId: headers.organizationId,
    };

    fastify.log.debug(
      {
        userId: headers.userId,
        organizationId: headers.organizationId,
      },
      'BFF authentication successful'
    );
  });
};

export default fp(bffAuthPlugin, {
  name: 'bffAuth',
});
