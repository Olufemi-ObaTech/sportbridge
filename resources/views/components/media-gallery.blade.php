@props(['posts', 'title' => null, 'emptyText' => null, 'showUploadLink' => false])

<div class="card">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h6 mb-0">{{ $title ?? __('Videos & Photos') }}</h2>
            @if ($showUploadLink)
                <a href="{{ route('feed.index') }}" class="small">{{ __('Upload more') }} <i class="bi bi-plus-circle" aria-hidden="true"></i></a>
            @endif
        </div>

        @if ($posts->isEmpty())
            <x-empty-state icon="bi-images" :title="$emptyText ?? __('No videos or photos yet.')" />
        @else
            <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-2">
                @foreach ($posts as $post)
                    @php $firstMedia = $post->media_urls[0] ?? null; @endphp
                    @if ($firstMedia)
                        <div class="col">
                            <a href="{{ route('feed.index') }}#post-{{ $post->id }}" class="text-decoration-none">
                                <div class="ratio ratio-1x1 rounded overflow-hidden bg-dark position-relative">
                                    @if ($firstMedia['type'] === 'image')
                                        <img src="{{ asset('storage/'.$firstMedia['url']) }}" alt="" class="w-100 h-100" style="object-fit: cover;">
                                    @else
                                        <div class="w-100 h-100 d-flex align-items-center justify-content-center">
                                            <i class="bi bi-play-circle-fill text-white" style="font-size: 2rem;" aria-hidden="true"></i>
                                        </div>
                                    @endif
                                    @if (count($post->media_urls) > 1)
                                        <span class="badge text-bg-dark position-absolute top-0 end-0 m-1">+{{ count($post->media_urls) - 1 }}</span>
                                    @endif
                                </div>
                            </a>
                        </div>
                    @endif
                @endforeach
            </div>
        @endif
    </div>
</div>
