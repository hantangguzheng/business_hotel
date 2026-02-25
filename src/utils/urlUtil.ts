import { STATIC_ROOT } from './config';

export const toAbsoluteUrl = (url: string) => {
    if (url.trim().startsWith('/')) {
        return `${STATIC_ROOT}${url}`;
    }
    return url;
};

export const toAbsoluteUrls = (urls?: string[]) =>
    urls?.map(toAbsoluteUrl);

export const processImgUrl = (url: string) => {
    if (url.trim().startsWith('/static')) {
        return `${STATIC_ROOT}${url}`;
    }
    return url;
}