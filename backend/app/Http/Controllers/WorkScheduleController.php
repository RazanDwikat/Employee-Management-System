<?php

namespace App\Http\Controllers;

use App\Models\WorkSchedule;
use App\Services\WorkScheduleService;
use App\Http\Requests\Admin\StoreWorkScheduleRequest;
use App\Http\Requests\Admin\UpdateWorkScheduleRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkScheduleController extends Controller
{
    protected $service;

    public function __construct(WorkScheduleService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return WorkSchedule::paginate(5);
    }

    
    public function show($id)
    {
        return WorkSchedule::findOrFail($id);
    }

    
    public function store(StoreWorkScheduleRequest $request)
    {
        $schedule = $this->service->create($request->validated());

        return response()->json([
            'message' => 'Work schedule created successfully',
            'data' => $schedule
        ], 201);
    }

    
    public function update(UpdateWorkScheduleRequest $request, $id)
    {
        $schedule = WorkSchedule::findOrFail($id);

        $schedule = $this->service->update($schedule, $request->validated());

        return response()->json([
            'message' => 'Work schedule updated successfully',
            'data' => $schedule
        ]);
    }

    
    public function destroy($id)
    {
        $schedule = WorkSchedule::findOrFail($id);

        $this->service->delete($schedule);

        return response()->json([
            'message' => 'Work schedule deleted successfully'
        ]);
    }
}