<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return MenuItem::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'price' => 'required|numeric',
            'category' => 'required|string',
            'image' => 'nullable|string',
        ]);

        return MenuItem::create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return MenuItem::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->update($request->all());
        return $menuItem;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        MenuItem::destroy($id);
        return response()->noContent();
    }
}
