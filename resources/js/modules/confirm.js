function ensureModal() {
    let modalEl = document.getElementById('fcConfirmModal');
    if (modalEl) {
        return modalEl;
    }

    modalEl = document.createElement('div');
    modalEl.id = 'fcConfirmModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.setAttribute('aria-labelledby', 'fcConfirmModalLabel');
    modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title h5" id="fcConfirmModalLabel">Please confirm</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="fcConfirmModalBody">Are you sure?</div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="fcConfirmModalAccept">Confirm</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalEl);
    return modalEl;
}

document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-confirm]');
    if (!trigger) {
        return;
    }

    if (trigger.dataset.confirmed === 'true') {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const modalEl = ensureModal();
    const bodyEl = modalEl.querySelector('#fcConfirmModalBody');
    const acceptEl = modalEl.querySelector('#fcConfirmModalAccept');
    bodyEl.textContent = trigger.dataset.confirm || 'Are you sure?';
    acceptEl.className = 'btn ' + (trigger.dataset.confirmVariant || 'btn-danger');
    acceptEl.textContent = trigger.dataset.confirmLabel || 'Confirm';

    const modal = window.bootstrap.Modal.getOrCreateInstance(modalEl);

    const onAccept = () => {
        modal.hide();
        acceptEl.removeEventListener('click', onAccept);
        trigger.dataset.confirmed = 'true';
        if (trigger.tagName === 'A') {
            trigger.click();
        } else if (trigger.tagName === 'BUTTON' && trigger.form) {
            trigger.form.requestSubmit(trigger);
        } else {
            trigger.click();
        }
        delete trigger.dataset.confirmed;
    };

    acceptEl.addEventListener('click', onAccept);
    modal.show();
});
