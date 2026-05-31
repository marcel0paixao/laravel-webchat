<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;
class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'name' => ['required','string','max:255'],
            'username' => ['required','string','min:3','max:32','regex:/^[a-z0-9_]+$/','unique:users,username'],
            'email' => ['required','email','max:255','unique:users,email'],
            'phone' => ['required','string','max:32','unique:users,phone'],
            'password' => ['required','confirmed'],
        ];
    }
}
