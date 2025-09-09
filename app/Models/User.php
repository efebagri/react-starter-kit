<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use LaravelIdea\Helper\App\Models\_IH_Permission_C;
use LaravelIdea\Helper\App\Models\_IH_Role_C;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, LogsActivity;

    protected ?\Illuminate\Support\Collection $cachedPermissions = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }



    /**
     * @return HasMany
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(Session::class, 'user_id', 'id');
    }

    /**
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_users', 'user_id', 'role_id');
    }

    /**
     * @return BelongsToMany
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_users', 'user_id', 'permission_id');
    }

    /**
     *  Get all permissions assigned directly and through roles.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getPermissionSlugs(): \Illuminate\Support\Collection
    {
        if ($this->cachedPermissions) {
            return $this->cachedPermissions;
        }

        // Combine direct + role permissions
        $direct = $this->permissions()->pluck('slug');
        $viaRoles = $this->roles()->with('permissions')->get()
            ->pluck('permissions')->flatten()->pluck('slug');

        return $this->cachedPermissions = $direct->merge($viaRoles)->unique()->values();
    }

    /**
     * @param string|Role $role
     * @return bool
     */
    public function hasRole(string|Role $role): bool
    {
        if (is_string($role)) {
            return $this->roles->contains('slug', $role);
        }

        if ($role instanceof Role) {
            return $this->roles->contains('id', $role->id);
        }

        return false;
    }

    /**
     * Check if a user has a specific permission (by slug or Permission model).
     *
     * @param string|Permission $permission
     * @return bool
     */
    public function hasPermission(Permission|string $permission): bool
    {
        $slug = is_string($permission) ? $permission : $permission->slug;

        return $this->getPermissionSlugs()->contains($slug);
    }

    /**
     * @param array|string|Role $roles
     * @return $this
     */
    public function assignRole(array|string|Role $roles): static
    {
        $roleIds = $this->getRoleIds($roles);

        if (!empty($roleIds)) {
            $this->roles()->syncWithoutDetaching($roleIds);
        }

        return $this;
    }

    /**
     * @param array|string|Role $roles
     * @return $this
     */
    public function removeRole(array|string|Role $roles): static
    {
        $roleIds = $this->getRoleIds($roles);

        if (!empty($roleIds)) {
            $this->roles()->detach($roleIds);
        }

        return $this;
    }

    /**
     * @param array|string|Role $roles
     * @return $this
     */
    public function syncRoles(array|string|Role $roles): static
    {
        $roleIds = $this->getRoleIds($roles);

        $this->roles()->sync($roleIds);

        return $this;
    }

    /**
     * @param array|string|Role $roles
     * @return array
     */
    protected function getRoleIds(array|string|Role $roles): array
    {
        if (is_string($roles)) {
            $role = Role::where('slug', $roles)->first();
            return $role ? [$role->id] : [];
        }

        if ($roles instanceof Role) {
            return [$roles->id];
        }

        if (is_array($roles)) {
            $roleIds = [];

            foreach ($roles as $role) {
                if (is_string($role)) {
                    $r = Role::where('slug', $role)->first();
                    if ($r) {
                        $roleIds[] = $r->id;
                    }
                } elseif ($role instanceof Role) {
                    $roleIds[] = $role->id;
                }
            }

            return $roleIds;
        }

        return [];
    }

    /**
     * @return _IH_Role_C|Role[]
     */
    public function allRoles(): _IH_Role_C|array
    {
        return Role::withCount('permissions')->get();
    }

    /**
     * @return Collection|_IH_Permission_C|array
     */
    public function allPermissions(): Collection|_IH_Permission_C|array
    {
        return Permission::all();
    }

    public function twoFactorAuthentication(): HasOne
    {
        return $this->hasOne(TwoFactorAuthentication::class);
    }

    public function webAuthnCredentials(): HasMany
    {
        return $this->hasMany(WebAuthnCredential::class);
    }

    public function hasTwoFactorAuthenticationEnabled(): bool
    {
        return $this->twoFactorAuthentication?->isConfirmed() ?? false;
    }

    public function hasWebAuthnCredentials(): bool
    {
        return $this->webAuthnCredentials()->exists();
    }
}
