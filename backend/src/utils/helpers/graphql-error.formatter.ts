import { GraphQLError, GraphQLFormattedError } from 'graphql';

export function formatGraphQLError(error: GraphQLError): GraphQLFormattedError {
  const originalError = error.extensions?.originalError as any;

  // Handle throttling errors
  if (error.extensions?.code === 'THROTTLE_ERROR') {
    return {
      message: error.message,
      extensions: {
        code: 'THROTTLE_ERROR',
        status: 429,
      },
    };
  }

  // Handle validation errors
  if (originalError?.message) {
    // If it's an array of validation messages, return the first one
    const message = Array.isArray(originalError.message)
      ? originalError.message[0]
      : originalError.message;

    return {
      message,
      extensions: {
        code: 'BAD_USER_INPUT',
        status: originalError.status || 400,
      },
    };
  }

  // Define error codes mapping
  const errorCodesMap = {
    UnprocessableEntityException: 'UNPROCESSABLE_ENTITY',
    NotFoundException: 'NOT_FOUND',
    UnauthorizedException: 'UNAUTHORIZED',
    BadRequestException: 'BAD_REQUEST',
    ForbiddenException: 'UNAUTHORIZED',
  };

  // Get the error type
  const errorType = originalError?.constructor?.name || 'InternalServerError';

  return {
    message: error.message,
    extensions: {
      code: errorCodesMap[errorType] || 'INTERNAL_SERVER_ERROR',
      status: originalError?.statusCode || 500,
    },
  };
}
