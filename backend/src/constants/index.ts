export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CMS_USER: 'CMS_USER',
  SURVEYOR: 'SURVEYOR',
  BENEFICIARY: 'BENEFICIARY',
} as const;

export type RoleType = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserRole = RoleType;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as Record<string, number>;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required. Please provide a valid JWT access token.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  INVALID_CREDENTIALS: 'Invalid mobile number, email, or password.',
  USER_NOT_FOUND: 'User account not found.',
  DUPLICATE_MOBILE: 'Mobile number is already registered in the system.',
  DUPLICATE_EMAIL: 'Email address is already registered in the system.',
  DUPLICATE_SURVEY_NUMBER: 'Survey / Ration card number is already registered.',
  INVALID_TOKEN: 'Invalid or expired session token.',
  TOKEN_EXPIRED: 'Session expired. Please log in again.',
  SERVER_ERROR: 'An unexpected internal server error occurred.',
  VALIDATION_ERROR: 'Request payload validation failed.',
};
