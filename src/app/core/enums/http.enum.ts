export enum Header {
  SkipLoading = 'X-Skip-Loading',
  SkipAuth = 'X-Skip-Auth',
  SkipToastError = 'X-Skip-Toast-Error',
  CorrelationId = 'X-Correlation-Id',
}

export enum HttpError {
    ConnectionRefused = 0, 
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504
}
