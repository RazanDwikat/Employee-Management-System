<?php
namespace App\Events;

use Illuminate\Queue\SerializesModels;
use App\Models\User;

class UserCreated
{
    use SerializesModels;

    public $adminId;
    public $user;

    public function __construct($adminId, User $user)
    {
        $this->adminId = $adminId;
        $this->user = $user;
    }
}