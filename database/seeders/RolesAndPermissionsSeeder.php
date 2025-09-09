<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // php artisan db:seed --class=Database\\Seeders\\RolesAndPermissionsSeeder
        $permissions = [
            ['name' => 'View Admin Panel', 'slug' => 'view_admin_panel'],

            // Audit Log Management
            ['name' => 'View Audit Logs', 'slug' => 'view_audit_logs'],
            ['name' => 'Export Audit Logs', 'slug' => 'export_audit_logs'],

            // Role Management
            ['name' => 'View Roles', 'slug' => 'view_roles'],
            ['name' => 'Create Roles', 'slug' => 'create_roles'],
            ['name' => 'Edit Roles', 'slug' => 'edit_roles'],
            ['name' => 'Delete Roles', 'slug' => 'delete_roles'],

            // User Management
            ['name' => 'View User', 'slug' => 'view_user'],
            ['name' => 'Create User', 'slug' => 'create_user'],
            ['name' => 'Edit User', 'slug' => 'edit_user'],
            ['name' => 'Delete User', 'slug' => 'delete_user'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'slug' => $permission['slug']
            ], [
                'name' => $permission['name'],
                'description' => 'Allows ' . strtolower($permission['name']),
            ]);
        }

        $adminRole = Role::firstOrCreate([
            'slug' => 'admin'
        ], [
            'name' => 'Administrator',
            'description' => 'Administrator with all permissions',
        ]);

        // Assign all permissions to admin role
        $adminRole->syncPermissions(Permission::all());

        $admin = User::first();
        if ($admin) {
            $admin->syncRoles([$adminRole]);
        }
    }
}
