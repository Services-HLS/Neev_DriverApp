export function EcoBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary/8 blur-3xl animate-eco-float" />
      <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-secondary/15 blur-3xl animate-eco-float [animation-delay:-2s]" />
      <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-teal/10 blur-3xl animate-eco-float [animation-delay:-4s]" />
    </div>
  );
}
