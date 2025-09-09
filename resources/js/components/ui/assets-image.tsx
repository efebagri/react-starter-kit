import { usePage } from '@inertiajs/react';
import type { ImgHTMLAttributes } from 'react';

interface AssetImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string; // relative path inside /public/assets
}

const AssetImage = ({ src, ...rest }: AssetImageProps) => {
    const { props } = usePage();
    const baseUrl = String(props.url ?? 'http://127.0.0.1');

    // Prepend base URL to a relative asset path
    const fullSrc = `${baseUrl}/${src.replace(/^\/+/, '')}`;

    return <img src={fullSrc} {...rest}  alt={'DUMMY'}/>;
};

export default AssetImage;
