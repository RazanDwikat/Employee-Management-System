<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ReportService;
use App\Http\Requests\Admin\MySalariesRequest;

class ReportController extends Controller
{
    protected $service;

    public function __construct(ReportService $service)
    {
        $this->service = $service;
    }

    //  Employee Report
    public function employees()
    {
        return $this->service->employeeReport();
        
    }

    // Department Distribution
    public function departments()
    {
        return response()->json(
            $this->service->departmentDistribution()
        );
    }

    //  Attendance Report
    public function attendance(Request $request)
{
    $request->validate([
        'month' => 'required|integer',
        'year' => 'required|integer',
        'employee_id' => 'nullable|exists:employees,id',
        'department_id' => 'nullable|exists:departments,id',
    ]);

    return response()->json(
        $this->service->attendanceReport($request->all())
    );
}

     public function attendancePdf(MySalariesRequest $request)
    {
    
        return $this->service->attendanceReportPdf($request->validated());
    }

    //  Salary Insights
    public function salaries(MySalariesRequest $request)
    {

        return response()->json(
            $this->service->salaryInsights($request->month, $request->year)
        );
    }

    // Leave Insights
    public function leaves(MySalariesRequest $request)
    {
    
        return response()->json(
            $this->service->leaveInsights($request->month, $request->year)
        );
    }
}