<?php

namespace App\Services;

use App\Models\WorkSchedule;

class WorkScheduleService
{
    public function create(array $data)
    {
        return WorkSchedule::create($data);
    }

    public function update(WorkSchedule $schedule, array $data)
    {
        $schedule->update($data);
        return $schedule;
    }

    public function delete(WorkSchedule $schedule)
    {
        $schedule->employees()->update(['work_schedule_id' => null]);
        $schedule->delete();
    }
}