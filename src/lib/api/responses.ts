/**
 * API Response Utilities
 *
 * Helper functions for creating consistent API responses.
 */

import { NextResponse } from 'next/server';
import type { ApiError, ApiErrorCode } from './types';

// =============================================================================
// SUCCESS RESPONSES
// =============================================================================

/**
 * Create a success response with data
 */
export function successResponse<T>(data: T, status = 200): NextResponse<T> {
	return NextResponse.json(data, { status });
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(data: T): NextResponse<T> {
	return NextResponse.json(data, { status: 201 });
}

/**
 * Create a no content response (204)
 */
export function noContentResponse(): NextResponse {
	return new NextResponse(null, { status: 204 });
}

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/**
 * Create an error response
 */
export function errorResponse(
	code: ApiErrorCode,
	message: string,
	status: number,
	details?: Record<string, unknown>
): NextResponse<ApiError> {
	return NextResponse.json(
		{
			error: {
				code,
				message,
				...(details && { details }),
			},
		},
		{ status }
	);
}

/**
 * Create an unauthorized error response (401)
 */
export function unauthorizedResponse(
	message = 'Authentication required'
): NextResponse<ApiError> {
	return errorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Create a forbidden error response (403)
 */
export function forbiddenResponse(
	message = 'Access denied'
): NextResponse<ApiError> {
	return errorResponse('FORBIDDEN', message, 403);
}

/**
 * Create a not found error response (404)
 */
export function notFoundResponse(
	message = 'Resource not found'
): NextResponse<ApiError> {
	return errorResponse('NOT_FOUND', message, 404);
}

/**
 * Create a validation error response (400)
 */
export function validationErrorResponse(
	message: string,
	details?: Record<string, unknown>
): NextResponse<ApiError> {
	return errorResponse('VALIDATION_ERROR', message, 400, details);
}

/**
 * Create a conflict error response (409)
 */
export function conflictResponse(
	message: string,
	details?: Record<string, unknown>
): NextResponse<ApiError> {
	return errorResponse('CONFLICT', message, 409, details);
}

/**
 * Create an internal server error response (500)
 */
export function internalErrorResponse(
	message = 'An unexpected error occurred'
): NextResponse<ApiError> {
	return errorResponse('INTERNAL_ERROR', message, 500);
}

