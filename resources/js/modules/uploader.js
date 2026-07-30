const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return 'Unsupported file type. Use JPG, PNG, WEBP, or MP4/MOV video.';
    }

    const isVideo = file.type.startsWith('video/');
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

    if (file.size > maxBytes) {
        return `File is too large. Max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.`;
    }

    return null;
}

function createProgressRow(file) {
    const row = document.createElement('div');
    row.className = 'd-flex align-items-center gap-2 mb-2';
    row.innerHTML = `
        <img class="rounded" style="width:40px;height:40px;object-fit:cover;" alt="">
        <div class="flex-grow-1">
            <div class="small text-truncate">${file.name}</div>
            <div class="progress" style="height:6px;">
                <div class="progress-bar" role="progressbar" style="width:0%"></div>
            </div>
        </div>
        <span class="upload-status small text-muted">0%</span>
    `;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
            row.querySelector('img').src = reader.result;
        };
        reader.readAsDataURL(file);
    } else {
        row.querySelector('img').src = 'https://placehold.co/40x40?text=%F0%9F%8E%A5';
    }

    return row;
}

function uploadFile(uploadUrl, file, row) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append(file.type.startsWith('image/') ? 'image' : 'video', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken());
        xhr.setRequestHeader('Accept', 'application/json');

        const bar = row.querySelector('.progress-bar');
        const status = row.querySelector('.upload-status');

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                bar.style.width = `${percent}%`;
                status.textContent = `${percent}%`;
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                status.textContent = 'Done';
                status.classList.add('text-success');
                resolve();
            } else {
                let message = 'Upload failed';
                try {
                    message = JSON.parse(xhr.responseText).message ?? message;
                } catch { /* ignore parse error */ }
                status.textContent = message;
                status.classList.add('text-danger');
                reject(new Error(message));
            }
        });

        xhr.addEventListener('error', () => {
            status.textContent = 'Network error';
            status.classList.add('text-danger');
            reject(new Error('Network error'));
        });

        xhr.send(formData);
    });
}

export function initUploader() {
    const root = document.getElementById('player-uploader');
    if (!root) {
        return;
    }

    const dropzone = root.querySelector('.fc-dropzone');
    const fileInput = root.querySelector('input[type="file"]');
    const progressList = root.querySelector('.upload-progress-list');
    const youtubeForm = root.querySelector('.youtube-form');
    const uploadUrl = root.dataset.uploadUrl;
    const youtubeUrl = root.dataset.youtubeUrl;

    async function handleFiles(files) {
        for (const file of Array.from(files)) {
            const error = validateFile(file);
            const row = createProgressRow(file);
            progressList.appendChild(row);

            if (error) {
                row.querySelector('.upload-status').textContent = error;
                row.querySelector('.upload-status').classList.add('text-danger');
                continue;
            }

            try {
                await uploadFile(uploadUrl, file, row);
            } catch {
                // Error already reflected in the row's status text.
            }
        }

        window.location.reload();
    }

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.classList.add('is-dragover');
        });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropzone.classList.remove('is-dragover');
        });
    });

    dropzone.addEventListener('drop', (event) => {
        if (event.dataTransfer?.files?.length) {
            handleFiles(event.dataTransfer.files);
        }
    });

    youtubeForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = youtubeForm.querySelector('input[name="url"]');
        const submitBtn = youtubeForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            const response = await fetch(youtubeUrl, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: input.value }),
            });

            if (response.status === 422) {
                const body = await response.json();
                alert(Object.values(body.errors ?? {}).flat().join('\n') || 'Invalid YouTube URL.');
                return;
            }

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            window.location.reload();
        } catch (error) {
            alert('Could not add this video. Please try again.');
            console.error(error);
        } finally {
            submitBtn.disabled = false;
        }
    });
}
