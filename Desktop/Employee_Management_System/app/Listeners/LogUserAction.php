<?php
namespace App\Listeners;

use App\Events\UserCreated;
use Illuminate\Support\Facades\Log;

class LogUserAction
{
    public function handle(UserCreated $event)
    {
        Log::info("Admin ID {$event->adminId} created user {$event->user->id} ({$event->user->email})");
    }
}