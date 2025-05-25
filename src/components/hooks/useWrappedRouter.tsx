import { useRouter } from 'next/navigation';

export function useWrappedRouter({
  confirmMessage,
  shouldBlock
} : Readonly<{
  confirmMessage: string,
  shouldBlock: boolean
}>) {
  const router = useRouter();

  const confirmNavigation = (): boolean => {
    return !shouldBlock || confirm(confirmMessage);
  };

  const push = (href: string) => {
    if (confirmNavigation()) router.push(href);
  };

  const replace = (href: string) => {
    if (confirmNavigation()) router.replace(href);
  };

  const back = () => {
    if (confirmNavigation()) router.back();
  };

  const forward = () => {
    if (confirmNavigation()) router.forward();
  };

  return {
  push,
  replace,
  back,
  forward,
  };
}