export function getShareUrl(id: number) {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.host}/gallery/explore?media=${id}`;
}

export function shareMediaUrl(id: number) {
    const toShare = getShareUrl(id);
    if (navigator.canShare && navigator.canShare({ text: toShare })) {
        navigator.share({ text: toShare });
        return true;
    } else {
        navigator.clipboard?.writeText(toShare);
        return false;
    }
}