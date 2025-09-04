import HomepageLayoutTemplate from '@/layouts/home/homepage-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface HomepageLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, ...props }: HomepageLayoutProps) => (
    <HomepageLayoutTemplate {...props}>
        {children}
    </HomepageLayoutTemplate>
);
