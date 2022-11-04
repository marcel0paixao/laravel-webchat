<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;
use Symfony\Component\HttpFundation\Response;
use Illuminate\Support\Facades\Auth;

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
        $message = new Message([
            'from' => Auth::id(),
            'to' => $request->to,
            'message' => $request->message
        ]);
        $message->save();
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
        //
    }
}
