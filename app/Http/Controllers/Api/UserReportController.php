<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{User, UserReport};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
class UserReportController extends Controller
{
    public function store(Request $request, int $id)
    {
        abort_if((int)Auth::id() === $id || !User::whereKey($id)->exists(), 404);
        $validated = $request->validate(['reason' => ['nullable','string','max:120'], 'details' => ['nullable','string','max:2000']]);
        UserReport::create(['reporter_id' => Auth::id(), 'reported_id' => $id, 'reason' => $validated['reason'] ?? 'profile_report', 'details' => $validated['details'] ?? null]);
        return response()->json(['message' => 'Report received.'], 201);
    }
}
