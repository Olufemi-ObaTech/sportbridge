@if ($player->mediaAssets->isEmpty())
    <x-empty-state icon="bi-images" :title="__('No media yet.')" />
@else
    <div class="row row-cols-1 row-cols-sm-2 g-3">
        @foreach ($player->mediaAssets as $media)
            <div class="col">
                <div class="ratio ratio-16x9">
                    @if ($media->type === 'youtube')
                        <iframe src="https://www.youtube.com/embed/{{ $media->youtube_embed_id }}" title="{{ $media->title }}"
                                allowfullscreen loading="lazy"></iframe>
                    @elseif ($media->type === 'video')
                        <video src="{{ asset('storage/'.$media->url) }}" controls class="w-100 h-100" style="object-fit:cover;"></video>
                    @else
                        <img src="{{ asset('storage/'.($media->thumbnail_url ?: $media->url)) }}" alt="{{ $media->title }}" class="w-100 h-100" style="object-fit:cover;" loading="lazy">
                    @endif
                </div>
            </div>
        @endforeach
    </div>
@endif
