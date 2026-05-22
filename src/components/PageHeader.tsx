export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="animate-fade-up">
      {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
      <h1 className="page-heading">{title}</h1>
      {description && <p className="page-desc">{description}</p>}
    </div>
  );
}
