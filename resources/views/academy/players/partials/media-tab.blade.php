@php
    $uploadUrl = $uploadUrl ?? route('academy.players.media.upload', $player);
    $youtubeUrl = $youtubeUrl ?? route('academy.players.media.youtube', $player);
    $featureRoute = $featureRoute ?? 'academy.media.feature';
    $destroyRoute = $destroyRoute ?? 'academy.media.destroy';
@endphp

<div id="player-uploader"
     data-upload-url="{{ $uploadUrl }}"
     data-youtube-url="{{ $youtubeUrl }}"
     class="mb-4">
    <div class="fc-dropzone p-4 text-center" tabindex="0" role="button" aria-label="{{ __('Upload image or video') }}">
        <i class="bi bi-cloud-arrow-up fs-2 d-block mb-2" aria-hidden="true"></i>
        <p class="mb-1">{{ __('Drag and drop an image or video here, or click to browse') }}</p>
        <p class="small text-muted mb-2">{{ __('JPG, PNG, WEBP, MP4 - max 50MB') }}</p>
        <input type="file" class="d-none" accept="image/*,video/mp4,video/quicktime">
    </div>
    <div class="upload-progress-list mt-2"></div>

    <form class="row g-2 mt-3 youtube-form">
        <div class="col-12 col-sm-8">
            <input type="text" class="form-control" name="url" placeholder="{{ __('Paste a YouTube URL') }}" aria-label="{{ __('YouTube URL') }}">
        </div>
        <div class="col-12 col-sm-4">
            <button type="submit" class="btn btn-outline-primary w-100">{{ __('Add Video') }}</button>
        </div>
    </form>
</div>

<div class="row row-cols-2 row-cols-md-3 g-3" id="media-gallery">
    @forelse ($player->mediaAssets as $media)
        <div class="col" data-media-id="{{ $media->id }}">
            <div class="card h-100">
                <div class="ratio ratio-16x9 bg-dark bg-opacity-10">
                    @if ($media->type === 'youtube')
                        <img src="{{ $media->thumbnail_url }}" alt="" class="object-fit-cover">
                    @elseif ($media->type === 'image')
                        <img src="{{ asset('storage/'.($media->thumbnail_url ?: $media->url)) }}" alt="" class="object-fit-cover">
                    @else
                        <div class="d-flex align-items-center justify-content-center"><i class="bi bi-camera-reels fs-2 text-muted" aria-hidden="true"></i></div>
                    @endif
                </div>
                <div class="card-body p-2 d-flex justify-content-between align-items-center">
                    <span class="badge text-bg-{{ $media->is_featured ? 'warning' : 'light border' }}">
                        {{ $media->is_featured ? __('Featured') : ucfirst($media->type) }}
                    </span>
                    <div class="d-flex gap-1">
                        <form method="POST" action="{{ route($featureRoute, $media) }}">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-outline-secondary" title="{{ __('Set as featured') }}" aria-label="{{ __('Set as featured') }}">
                                <i class="bi bi-star" aria-hidden="true"></i>
                            </button>
                        </form>
                        <form method="POST" action="{{ route($destroyRoute, $media) }}">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-sm btn-outline-danger" data-confirm="{{ __('Remove this media item?') }}" aria-label="{{ __('Delete media') }}">
                                <i class="bi bi-trash" aria-hidden="true"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    @empty
        <div class="col-12">
            <x-empty-state icon="bi-images" :title="__('No media uploaded yet.')" />
        </div>
    @endforelse
</div>
