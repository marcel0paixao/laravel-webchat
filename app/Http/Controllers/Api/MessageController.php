<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Message, User};
use Illuminate\Http\Request;
use Symfony\Component\HttpFundation\Response;
use Illuminate\Support\Facades\{
    Auth, Event
};
use App\Events\Chat\SendMessage;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {       
        $messages = Message::where(
            function ($query) use ($request)
            {
                $query->where([
                    'from' => $request->user_id,
                    'to' => Auth::id()
                ]);
            }
        )
        ->orWhere(
            function ($query) use ($request)
            {
                $query->where([
                    'from' => Auth::id(),
                    'to' => $request->user_id
                ]);
            }
        )->orderBy('created_at', 'ASC')->whereNull('deleted_at')->get();
                            
        return response()->json(['messages' => $messages], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required',
            'from' => 'required',
            'to' => 'required',
        ]);

        $message = new Message([
            'from' => Auth::id(),
            'to' => $request->to,
            'message' => $request->message
        ]);
        $message->save();

        Event::dispatch(new SendMessage($message, $message->to));

        return redirect()->back();
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if (!$user = User::find($id)) {
            return response(404);
        }
        $messages = Message::where(
            function ($query) use ($user)
            {
                $query->where([
                    'from' => $user->id,
                    'to' => Auth::id()
                ]);
            }
        )
        ->orWhere(
            function ($query) use ($user)
            {
                $query->where([
                    'from' => Auth::id(),
                    'to' => $user->id
                ]);
            }
        )->whereNull('deleted_at')->delete();

        return response(204);
    }

    public static function last_messages()
    {
        $last_messages = [];
        foreach (Message::where('to', Auth::id())->orderBy('created_at', 'DESC')->get() as $key => $message) {
            //grouping by from
            if (!array_key_exists($message->from, $last_messages)) {
                $last_messages[$message->from] = $message;
            }
        }
        return $last_messages;
    }
}
