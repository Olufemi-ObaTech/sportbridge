<div class="card mb-3" id="post-{{ $post->id }}">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-person-circle fs-3 text-muted" aria-hidden="true"></i>
                <div>
                    <div class="fw-semibold">{{ $post->author->name }}</div>
                    <div class="small text-muted">{{ $post->created_at->diffForHumans() }}</div>
                </div>
            </div>
            <div class="d-flex gap-1">
                @if ($post->sport)
                    <span class="badge text-bg-light border">{{ __(ucfirst($post->sport)) }}</span>
                @endif
                @if ($post->is_live)
                    <span class="badge text-bg-danger"><i class="bi bi-broadcast me-1" aria-hidden="true"></i>{{ __('Live Video') }}</span>
                @endif
                @if ($post->is_training)
                    <span class="badge text-bg-primary"><i class="bi bi-camera-video-fill me-1" aria-hidden="true"></i>{{ __('Training Session') }}</span>
                @endif
                @if ($post->is_pinned)
                    <span class="badge text-bg-warning"><i class="bi bi-pin-angle-fill me-1" aria-hidden="true"></i>{{ __('Pinned') }}</span>
                @endif
            </div>
        </div>

        <p class="mb-2" style="white-space: pre-line;">{{ $post->content }}</p>

        @if ($post->is_live)
            <div class="fc-dropzone p-3 mb-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                    <span class="badge text-bg-danger mb-1"><i class="bi bi-broadcast me-1" aria-hidden="true"></i>{{ __('LIVE') }}</span>
                    @if ($post->live_at)
                        <div class="small fw-semibold"><i class="bi bi-calendar-event me-1" aria-hidden="true"></i>{{ $post->live_at->format('M j, Y g:i A') }}</div>
                    @endif
                </div>
                @if ($post->live_link)
                    <a href="{{ $post->live_link }}" target="_blank" rel="noopener" class="btn btn-sm btn-danger">
                        <i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>{{ __('Watch Live') }}
                    </a>
                @endif
            </div>
        @endif

        @if ($post->is_training)
            <div class="fc-dropzone p-3 mb-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                    @if ($post->training_at)
                        <div class="small fw-semibold"><i class="bi bi-calendar-event me-1" aria-hidden="true"></i>{{ $post->training_at->format('M j, Y g:i A') }}</div>
                    @endif
                </div>
                @if ($post->training_link)
                    <a href="{{ $post->training_link }}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">
                        <i class="bi bi-box-arrow-up-right me-1" aria-hidden="true"></i>{{ __('Join Training') }}
                    </a>
                @endif
            </div>
        @endif

        @if (!empty($post->media_urls))
            <div class="row row-cols-2 g-2 mb-2">
                @foreach ($post->media_urls as $item)
                    <div class="col">
                        @if (($item['type'] ?? 'image') === 'video')
                            <video src="{{ asset('storage/'.$item['url']) }}" class="w-100 rounded" style="aspect-ratio:1/1;object-fit:cover;" controls></video>
                        @elseif (($item['type'] ?? 'image') === 'youtube')
                            <div class="ratio ratio-1x1">
                                <iframe src="https://www.youtube.com/embed/{{ $item['url'] }}" title="YouTube video" class="rounded" allowfullscreen></iframe>
                            </div>
                        @else
                            <img src="{{ asset('storage/'.$item['url']) }}" alt="" class="w-100 rounded" style="aspect-ratio:1/1;object-fit:cover;">
                        @endif
                    </div>
                @endforeach
            </div>
        @endif

        <div class="d-flex align-items-center gap-3 border-top pt-2">
            @auth
                <button type="button" class="btn btn-sm btn-link text-decoration-none like-toggle" data-url="{{ route('feed.like', $post) }}">
                    <i class="bi bi-hand-thumbs-up me-1" aria-hidden="true"></i>
                    <span class="likes-count">{{ $post->likes_count }}</span>
                </button>
            @else
                <span class="small text-muted"><i class="bi bi-hand-thumbs-up me-1" aria-hidden="true"></i>{{ $post->likes_count }}</span>
            @endauth

            <span class="small text-muted"><i class="bi bi-chat me-1" aria-hidden="true"></i>{{ $post->comments_count }}</span>

            @auth
                @if (auth()->user()->id === $post->author_id)
                    <form method="POST" action="{{ route('feed.pin', $post) }}" class="ms-auto">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-link text-decoration-none">{{ __('Pin') }}</button>
                    </form>
                    <form method="POST" action="{{ route('feed.destroy', $post) }}">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-link text-decoration-none text-danger" data-confirm="{{ __('Delete this post?') }}">{{ __('Delete') }}</button>
                    </form>
                @endif
            @endauth
        </div>

        @if ($post->comments->isNotEmpty())
            <div class="mt-2 border-top pt-2">
                @foreach ($post->comments as $comment)
                    <div class="small mb-1"><strong>{{ $comment->user->name }}</strong> {{ $comment->body }}</div>
                @endforeach
            </div>
        @endif

        @auth
            @if (auth()->user()->isActive())
                <form method="POST" action="{{ route('feed.comments.store', $post) }}" class="mt-2 d-flex gap-2">
                    @csrf
                    <input type="text" name="body" class="form-control form-control-sm" placeholder="{{ __('Write a comment...') }}" required>
                    <button type="submit" class="btn btn-sm btn-outline-primary">{{ __('Send') }}</button>
                </form>
            @endif
        @endauth
    </div>
</div>
