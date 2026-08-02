document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-copy-target]');
    if (!trigger) {
        return;
    }

    const source = document.querySelector(trigger.dataset.copyTarget);
    if (!source) {
        return;
    }

    navigator.clipboard.writeText(source.value || source.textContent).then(() => {
        const original = trigger.textContent;
        trigger.textContent = trigger.dataset.copiedLabel || 'Copied!';
        trigger.disabled = true;
        setTimeout(() => {
            trigger.textContent = original;
            trigger.disabled = false;
        }, 1500);
    });
});
