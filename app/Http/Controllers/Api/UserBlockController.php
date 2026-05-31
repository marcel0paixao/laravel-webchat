<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{User, UserBlock};
use Illuminate\Support\Facades\Auth;
class UserBlockController extends Controller
{
    public function store(int $id)
    {
        abort_if((int)Auth::id() === $id || !User::whereKey($id)->exists(), 404);
        UserBlock::firstOrCreate(['blocker_id' => Auth::id(), 'blocked_id' => $id]);
        return response()->json(['message' => 'User blocked.'], 201);
    }
    public function destroy(int $id)
    {
        UserBlock::where('blocker_id', Auth::id())->where('blocked_id', $id)->delete();
        return response()->noContent();
    }
}
