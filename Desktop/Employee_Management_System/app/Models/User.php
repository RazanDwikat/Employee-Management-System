<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject

{
    use SoftDeletes;

    protected $hidden = ['password'];

     protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status'
    ];
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
            'name' => $this->name
        ];
    }

    public function employee()
    {
         return $this->hasOne(Employee::class , 'user_id', 'id');
    }
}
