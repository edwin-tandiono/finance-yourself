export const showAppLoader = () => window.dispatchEvent(new CustomEvent('showAppLoader'));

export const hideAppLoader = () => window.dispatchEvent(new CustomEvent('hideAppLoader'));
