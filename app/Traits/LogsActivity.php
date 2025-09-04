<?php

namespace App\Traits;

use App\Models\AuditLog;
use App\Helpers\SystemHelper;

trait LogsActivity
{
    /**
     * @return void
     */
    public static function bootLogsActivity(): void
    {
        foreach (['created', 'updated', 'deleted'] as $event) {
            static::$event(function ($model) use ($event) {
                $clientInfo = SystemHelper::getClientInfo();

                AuditLog::create(array_merge([
                    'user_id'    => auth()->id(),
                    'action'     => $event,
                    'model_type' => get_class($model),
                    'model_id'   => $model->getKey(),
                    'old_values' => $event === 'updated' ? $model->getOriginal() : null,
                    'new_values' => in_array($event, ['created', 'updated']) ? $model->getAttributes() : null,
                ], $clientInfo));
            });
        }
    }
}
