type RoutePlaceholderProps = Readonly<{
  eyebrow: string;
  title: string;
  description: string;
}>;

export function RoutePlaceholder({ eyebrow, title, description }: RoutePlaceholderProps) {
  return (
    <main className="route-page" id="main-content">
      <section className="route-placeholder" aria-labelledby="route-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="route-title" id="route-title">{title}</h1>
        <p className="route-description">{description}</p>
        <p className="route-status">이동 경로 준비 완료</p>
      </section>
    </main>
  );
}
