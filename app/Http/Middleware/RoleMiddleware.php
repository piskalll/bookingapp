<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Generic role-based middleware.
 *
 * Usage in routes:  ->middleware('role:admin')
 *                   ->middleware('role:owner')
 *                   ->middleware('role:admin,owner')   ← any of these roles
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! auth()->check()) {
            return redirect()->route('login');
        }

        $userRole = auth()->user()->role ?? 'customer';

        if (in_array($userRole, $roles)) {
            return $next($request);
        }

        abort(403, 'Unauthorized — Anda tidak memiliki akses ke halaman ini.');
    }
}
