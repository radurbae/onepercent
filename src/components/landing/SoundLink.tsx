'use client';

import Link, { type LinkProps } from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import useClickSound from '@/components/landing/useClickSound';

type SoundLinkProps = LinkProps & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;

export default function SoundLink({ onClick, ...props }: SoundLinkProps) {
    const playClick = useClickSound();

    return (
        <Link
            {...props}
            onClick={(event) => {
                playClick();
                onClick?.(event);
            }}
        />
    );
}
