import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAdorableAvatar } from '@/hooks/use-adorable-avatar';
import { cn } from '@/extensions/utils';

export type UserAvatarProps = React.ComponentProps<typeof Avatar> & {
    string: string;
    /** Extra classes for the outer <Avatar> */
    className?: string;
    /** Inline styles for the outer <Avatar> */
    style?: React.CSSProperties;

    /** Extra classes for <AvatarImage> */
    imageClassName?: string;
    /** Inline styles for <AvatarImage> */
    imageStyle?: React.CSSProperties;

    /** Extra classes for <AvatarFallback> */
    fallbackClassName?: string;
    /** Inline styles for <AvatarFallback> */
    fallbackStyle?: React.CSSProperties;

    /** Rounding of image/fallback */
    rounded?: 'full' | 'lg' | 'md' | 'none';
};

export function UserAvatar({
       string,
       className,
       style,
       imageClassName,
       imageStyle,
       fallbackClassName,
       fallbackStyle,
       rounded = 'lg',
       ...rest
    }: UserAvatarProps) {
    const avatar = useAdorableAvatar(string);

    // Build initials safely (max 2 chars)
    const initials = string
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    const roundedClass =
        rounded === 'full' ? 'rounded-full'
            : rounded === 'md' ? 'rounded-md'
                : rounded === 'none' ? ''
                    : 'rounded-lg';

    return (
        <Avatar
            className={cn('h-10 w-10 rounded-2xl', className)}
            style={style}
            {...rest}
        >
            <AvatarImage
                src={avatar || undefined}
                alt={string}
                className={cn(roundedClass, imageClassName)}
                style={imageStyle}
            />
            <AvatarFallback
                className={cn(
                    roundedClass,
                    'bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white font-medium rounded-2xl',
                    fallbackClassName
                )}
                style={fallbackStyle}
            >
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
