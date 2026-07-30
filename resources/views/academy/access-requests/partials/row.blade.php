<tr>
    <td>{{ $request->agent->agency_name }}</td>
    <td><a href="{{ route('academy.players.show', $request->player) }}" class="text-decoration-none">{{ $request->player->full_name }}</a></td>
    <td class="small">{{ \Illuminate\Support\Str::limit($request->message, 80) }}</td>
    <td>
        <span class="badge text-bg-{{ match($request->status) { 'granted' => 'success', 'denied' => 'danger', default => 'secondary' } }}">
            {{ ucfirst($request->status) }}
        </span>
    </td>
    <td class="text-end">
        @if ($request->status === 'pending')
            <div class="d-flex gap-1 justify-content-end">
                @include('academy.access-requests.partials.actions')
            </div>
        @endif
    </td>
</tr>
