<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory, LogsActivity;

    /**
     * @var string
     */
    protected $table = 'permissions';

    /**
     * @var array<string>
     */
    protected $fillable = ['name', 'slug', 'description'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_roles');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_users')
            ->join('permission_roles', 'roles.id', '=', 'permission_roles.role_id')
            ->where('permission_roles.permission_id', $this->id)
            ->select('users.*')
            ->distinct();
    }

    /**
     * @param string $slug
     * @return Permission|null
     */
    public static function findBySlug(string $slug): ?Permission
    {
        return static::where('slug', $slug)->first();
    }
}
