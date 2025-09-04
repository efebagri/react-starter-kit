<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use LogsActivity;

    /**
     * @var string
     */
    protected $table = 'roles';

    /**
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_roles', 'role_id', 'permission_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_users', 'role_id', 'user_id');
    }

    /**
     * @param string|Permission $permission
     * @return bool
     */
    public function hasPermission($permission): bool
    {
        if (is_string($permission)) {
            return $this->permissions->contains('slug', $permission);
        }

        if ($permission instanceof Permission) {
            return $this->permissions->contains('id', $permission->id);
        }

        return false;
    }

    /**
     * @param string|Permission|array $permissions
     * @return $this
     */
    public function givePermissionTo($permissions)
    {
        $permissionIds = $this->getPermissionIds($permissions);

        if (!empty($permissionIds)) {
            $this->permissions()->syncWithoutDetaching($permissionIds);
        }

        return $this;
    }

    /**
     * @param string|Permission|array $permissions
     * @return $this
     */
    public function revokePermissionTo($permissions)
    {
        $permissionIds = $this->getPermissionIds($permissions);

        if (!empty($permissionIds)) {
            $this->permissions()->detach($permissionIds);
        }

        return $this;
    }

    /**
     * @param string|Permission|array $permissions
     * @return $this
     */
    public function syncPermissions($permissions): static
    {
        $permissionIds = $this->getPermissionIds($permissions);

        $this->permissions()->sync($permissionIds);

        return $this;
    }

    /**
     * @param string|Permission|array $permissions
     * @return array
     */
    protected function getPermissionIds($permissions): array
    {
        if (is_array($permissions) && isset($permissions[0]) && is_numeric($permissions[0])) {
            return $permissions;
        }

        if (is_object($permissions) && method_exists($permissions, 'pluck')) {
            return $permissions->pluck('id')->toArray();
        }

        if (is_object($permissions) && isset($permissions->id)) {
            return [$permissions->id];
        }

        if (is_string($permissions) || is_numeric($permissions)) {
            $permission = is_numeric($permissions)
                ? Permission::find($permissions)
                : Permission::where('slug', $permissions)->first();

            return $permission ? [$permission->id] : [];
        }

        return [];
    }


    /**
     * @param string $slug
     * @return Role|null
     */
    public static function findBySlug(string $slug)
    {
        return static::where('slug', $slug)->first();
    }
}
