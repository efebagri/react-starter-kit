<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\MessageBag;

class APIResponse
{
    /**
     * @param mixed|null $data
     * @param string $message
     * @param int $code
     * @return JsonResponse
     * Send a success response.
     */
    public static function success(mixed $data = null, string $message = 'Operation successful.', int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * @param string $message
     * @param array|MessageBag $errors
     * @param int $code
     * @return JsonResponse
     * Send an error response.
     */
    public static function error(string $message = 'An error occurred.', array|MessageBag $errors = [], int $code = 400): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
            'data' => null,
        ], $code);
    }

    /**
     * @param string $message
     * @return JsonResponse
     * Send a not found response.
     */
    public static function notFound(string $message = 'Resource not found.'): JsonResponse
    {
        return self::error($message, [], 404);
    }

    /**
     * @param string $message
     * @return JsonResponse
     * Send an unauthorized response.
     */
    public static function unauthorized(string $message = 'Unauthorized access'): JsonResponse
    {
        return self::error($message, [], 401);
    }

    /**
     * @param string $message
     * @return JsonResponse
     * Send a forbidden response.
     */
    public static function forbidden(string $message = 'Access denied.'): JsonResponse
    {
        return self::error($message, [], 403);
    }

    /**
     * @param string $message
     * @param array|MessageBag $errors
     * @return JsonResponse
     * Send a bad request response.
     */
    public static function badRequest(string $message = 'Bad request.', array|MessageBag $errors = []): JsonResponse
    {
        return self::error($message, $errors, 400);
    }

    /**
     * @param string $message
     * @return JsonResponse
     * Send too many requests responses.
     */
    public static function tooManyRequests(string $message = 'Too many requests.'): JsonResponse
    {
        return self::error($message, [], 429);
    }
}
