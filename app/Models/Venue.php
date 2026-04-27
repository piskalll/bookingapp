<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'address', 'image'])]
class Venue extends Model
{
    /** @use HasFactory<\Database\Factories\VenueFactory> */
    use HasFactory;

    /**
     * Get all courts for this venue.
     */
    public function courts(): HasMany
    {
        return $this->hasMany(Court::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
