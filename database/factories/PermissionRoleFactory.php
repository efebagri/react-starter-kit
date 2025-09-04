<?php

namespace Database\Factories;

use App\Models\Permission;
use App\Models\PermissionRole;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionRoleFactory extends Factory
{
    protected $model = PermissionRole::class;

    public function definition(): array
    {
        return [
            'permission_id' => Permission::factory(),
            'role_id' => Role::factory(),
        ];
    }
}
