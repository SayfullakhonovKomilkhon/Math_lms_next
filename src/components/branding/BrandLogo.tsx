import Image from 'next/image';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/icon.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      priority={priority}
      className={cn('shrink-0 object-cover', className)}
    />
  );
}
