export function getShareUrl() {
    return window.location.href;
}

export function shareMediaUrl() {
    const toShare = getShareUrl();
    if (navigator.canShare && navigator.canShare({ text: toShare })) {
        navigator.share({ text: toShare });
        return true;
    } else {
        navigator.clipboard?.writeText(toShare);
        return false;
    }
}