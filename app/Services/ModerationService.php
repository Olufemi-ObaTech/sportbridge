<?php

namespace App\Services;

use App\Models\AcademyProfile;
use App\Models\AdminLog;
use App\Models\AgentProfile;
use App\Models\User;
use App\Notifications\AccountApprovedNotification;
use App\Notifications\AccountDeniedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class ModerationService
{
    public function approve(User $admin, User $target): void
    {
        DB::transaction(function () use ($admin, $target) {
            $target->update(['status' => User::STATUS_ACTIVE]);
            $this->log($admin, $target, 'approve');
        });

        $target->notify(new AccountApprovedNotification);
    }

    public function deny(User $admin, User $target, string $reason): void
    {
        DB::transaction(function () use ($admin, $target, $reason) {
            $target->update(['status' => User::STATUS_DENIED]);
            $this->log($admin, $target, 'deny', $reason);
        });

        $target->notify(new AccountDeniedNotification($reason));
    }

    public function suspend(User $admin, User $target, ?string $reason = null): void
    {
        DB::transaction(function () use ($admin, $target, $reason) {
            $target->update(['status' => User::STATUS_SUSPENDED]);
            $this->log($admin, $target, 'suspend', $reason);
        });
    }

    public function reinstate(User $admin, User $target): void
    {
        DB::transaction(function () use ($admin, $target) {
            $target->update(['status' => User::STATUS_ACTIVE]);
            $this->log($admin, $target, 'reinstate');
        });
    }

    public function softDelete(User $admin, User $target): void
    {
        DB::transaction(function () use ($admin, $target) {
            $this->log($admin, $target, 'delete');
            $target->delete();
        });
    }

    public function restore(User $admin, User $target): void
    {
        DB::transaction(function () use ($admin, $target) {
            $target->restore();
            $this->log($admin, $target, 'reinstate', 'Restored from soft delete');
        });
    }

    public function verify(User $admin, AcademyProfile|AgentProfile $profile): void
    {
        DB::transaction(function () use ($admin, $profile) {
            $profile->update(['verified_badge' => true]);
            $this->log($admin, $profile->user, 'verify');
        });
    }

    protected function log(User $admin, ?User $target, string $action, ?string $reason = null): void
    {
        AdminLog::create([
            'admin_id' => $admin->id,
            'target_user_id' => $target?->id,
            'target_type' => $target ? User::class : null,
            'target_id' => $target?->id,
            'action' => $action,
            'reason' => $reason,
            'ip_address' => Request::ip(),
        ]);
    }
}
