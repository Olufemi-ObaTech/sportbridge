<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * The `linkedin` column accepts either a bare handle ("jane-doe") or a
 * full URL, since users may paste either. This builds a real link either way.
 */
trait HasLinkedin
{
    protected function linkedinUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                $value = trim((string) $this->linkedin);

                if ($value === '') {
                    return null;
                }

                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                    return $value;
                }

                return 'https://www.linkedin.com/in/'.ltrim($value, '/');
            },
        );
    }
}
