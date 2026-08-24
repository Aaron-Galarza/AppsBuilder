import { Footer, type FooterProps } from './Footer';
import { Header, type HeaderProps } from './Header';

export interface PublicLayoutProps {
  header?: Omit<HeaderProps, 'rightSlot'>;
  footer?: FooterProps;
  children: React.ReactNode;
}

export function PublicLayout({ header = {}, footer = {}, children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header {...header} />
      <main className="flex-1">{children}</main>
      <Footer {...footer} />
    </div>
  );
}
