<?php
namespace App\Http\Controllers;
use App\Models\{Friendship, User, UserBlock};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
class ProfileController extends Controller
{
    public function search()
    {
        return Inertia::render('Profiles/Search');
    }
    public function show(string $username)
    {
        $profile = User::where('username', ltrim($username, '@'))->firstOrFail();
        $profile->is_self = (int) $profile->id === (int) Auth::id();
        if (Auth::check() && !$profile->is_self) {
            $profile->is_blocked_by_me = UserBlock::blocks(Auth::id(), $profile->id);
            $profile->is_blocked_by_them = UserBlock::blocks($profile->id, Auth::id());
            $friendship = Friendship::between(Auth::id(), $profile->id)->first();
            $profile->friendship_status = ($profile->is_blocked_by_me || $profile->is_blocked_by_them) ? null : $friendship?->status;
            $profile->friendship_direction = ($profile->is_blocked_by_me || $profile->is_blocked_by_them || !$friendship)
                ? null
                : ((int)$friendship->requester_id === (int)Auth::id() ? 'outgoing' : 'incoming');
        }
        return Inertia::render('Profiles/Show', ['profile' => $profile]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'profile_photo' => ['nullable', 'image', 'max:4096'],
        ]);

        $user = $request->user();
        $user->forceFill(['name' => $validated['name'], 'bio' => $validated['bio'] ?? null]);
        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $user->profile_photo_path = $request->file('profile_photo')->store('profile-photos', 'public');
        }
        $user->save();

        return back();
    }
}
