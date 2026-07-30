const EXPECTED_COLUMNS = [
    'full_name', 'dob', 'nationality', 'position', 'secondary_position',
    'foot', 'height_cm', 'weight_kg', 'jersey_number', 'bio',
];
const REQUIRED_COLUMNS = ['full_name', 'dob', 'nationality', 'position', 'foot'];

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

function buildPreviewTable(headers, rows) {
    const table = document.createElement('table');
    table.className = 'table table-sm table-bordered small';

    const thead = document.createElement('thead');
    thead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.slice(0, 5).forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('');
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}

export function initCsvImport() {
    const container = document.getElementById('csv-import-app');
    if (!container || !window.Papa) {
        return;
    }

    const importUrl = container.dataset.importUrl;

    container.innerHTML = `
        <div class="fc-dropzone p-3 text-center mb-2">
            <i class="bi bi-file-earmark-spreadsheet fs-3 d-block mb-1" aria-hidden="true"></i>
            <p class="small mb-2">Upload a CSV or XLSX file with columns: ${EXPECTED_COLUMNS.join(', ')}</p>
            <input type="file" accept=".csv,.xlsx,.xls" class="form-control form-control-sm w-auto mx-auto">
        </div>
        <div class="import-feedback"></div>
        <div class="import-preview mb-2"></div>
        <button type="button" class="btn btn-primary btn-sm import-submit d-none">Import Players</button>
    `;

    const fileInput = container.querySelector('input[type="file"]');
    const feedback = container.querySelector('.import-feedback');
    const preview = container.querySelector('.import-preview');
    const submitBtn = container.querySelector('.import-submit');

    let selectedFile = null;

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) {
            return;
        }

        selectedFile = file;
        feedback.innerHTML = '';
        preview.innerHTML = '';

        if (file.name.toLowerCase().endsWith('.csv')) {
            window.Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                preview: 5,
                complete(results) {
                    const headers = results.meta.fields || [];
                    const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));

                    if (missing.length) {
                        feedback.innerHTML = `<div class="alert alert-warning py-2 small">Missing expected column(s): ${missing.join(', ')}</div>`;
                    } else {
                        feedback.innerHTML = `<div class="alert alert-success py-2 small">Headers look good. Previewing first ${results.data.length} rows.</div>`;
                    }

                    preview.appendChild(buildPreviewTable(headers, results.data));
                },
            });
        } else {
            feedback.innerHTML = '<div class="alert alert-info py-2 small">XLSX preview isn\'t available client-side - the file will be validated on the server.</div>';
        }

        submitBtn.classList.remove('d-none');
    });

    submitBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Importing...';

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(importUrl, {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                body: formData,
            });

            const body = await response.json();

            if (!response.ok) {
                feedback.innerHTML = `<div class="alert alert-danger py-2 small">${body.message || 'Import failed.'}</div>`;
                return;
            }

            let html = `<div class="alert alert-success py-2 small">Imported ${body.imported} player(s).</div>`;

            if (body.failed > 0) {
                html += `<div class="alert alert-warning py-2 small">${body.failed} row(s) had errors:</div>`;
                html += '<ul class="small">';
                body.errors.forEach((err) => {
                    html += `<li>Row ${err.row}: ${err.errors.join(', ')}</li>`;
                });
                html += '</ul>';
            } else {
                setTimeout(() => window.location.reload(), 1200);
            }

            feedback.innerHTML = html;
        } catch (error) {
            feedback.innerHTML = '<div class="alert alert-danger py-2 small">Import failed. Please try again.</div>';
            console.error(error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Import Players';
        }
    });
}
