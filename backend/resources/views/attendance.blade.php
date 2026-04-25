<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background: #4a90e2; color: white; padding: 8px; }
        td { padding: 6px; border: 1px solid #ddd; text-align: center; }
        tr:nth-child(even) { background: #f9f9f9; }
        .present { color: green; }
        .late    { color: orange; }
        .absent  { color: red; }
        .section-title { margin-top: 30px; background: #eee; padding: 8px; }
    </style>
</head>
<body>

    <h1>Attendance Report - {{ $month }}/{{ $year }}</h1>

    {{-- Daily Report --}}
    <h3 class="section-title">📅 Daily Summary</h3>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['daily_report'] as $day)
                <tr>
                    <td>{{ $day['date'] }}</td>
                    <td class="present">{{ $day['summary']['present'] }}</td>
                    <td class="late">{{ $day['summary']['late'] }}</td>
                    <td class="absent">{{ $day['summary']['absent'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Late Trend --}}
    <h3 class="section-title">⚠️ Late Trend</h3>
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Late Count</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['late_trend'] as $item)
                <tr>
                    <td>{{ $item['name'] }}</td>
                    <td class="late">{{ $item['late_count'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    {{-- Attendance Scores --}}
    <h3 class="section-title">🏆 Attendance Scores</h3>
    <table>
        <thead>
            <tr>
                <th>Employee</th>
                <th>Present</th>
                <th>Late</th>
                <th>Absent</th>
                <th>Score</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['attendance_scores'] as $item)
                <tr>
                    <td>{{ $item['name'] }}</td>
                    <td class="present">{{ $item['stats']['present'] }}</td>
                    <td class="late">{{ $item['stats']['late'] }}</td>
                    <td class="absent">{{ $item['stats']['absent'] }}</td>
                    <td><strong>{{ $item['score'] }}</strong></td>
                </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>