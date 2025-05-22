export interface CustomContext {
  req: {
    requestStartTime: number;
  };
  res: any;
}

export const operationLoggingPlugin = {
  requestDidStart: async () => ({
    willSendResponse: async (requestContext: any) => {
      const operationName =
        requestContext.operation?.name?.value ||
        requestContext.request.operationName ||
        'Anonymous Operation';

      // Skip logging for introspection queries
      if (operationName === 'IntrospectionQuery') {
        return;
      }

      const ctx = requestContext.contextValue as CustomContext;
      const startTime = ctx.req.requestStartTime;
      const endTime = Date.now();

      console.log(
        `[${new Date().toISOString()}] Operation: ${operationName} - Duration: ${
          endTime - startTime
        }ms`,
      );
    },
  }),
};
