<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Basketball data lives in a genuinely separate physical database
     * (`mysql_basketball`, swapped to an isolated sqlite ':memory:' in tests -
     * see phpunit.xml). RefreshDatabase only wraps the default connection in
     * a transaction unless told otherwise, so without this, basketball rows
     * created in one test would leak into the next.
     */
    protected $connectionsToTransact = [null, 'mysql_basketball', 'mysql_admin'];
}
