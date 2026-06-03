import ReserveCtaProminent from "@/components/ReserveCtaProminent";

export default function ExclusivitySection() {
  return (
    <section
      data-pizza-section="exclusivity"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#060606] px-6 md:min-h-[80vh] md:px-20"
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
        <h2 className="font-[family-name:var(--font-cinematic,serif)] text-5xl font-light leading-[1.05] tracking-[-0.02em] text-white md:text-7xl">
          Seventeen covers
          <br />
          each evening.
        </h2>

        <p className="mt-8 max-w-[480px] font-[family-name:var(--font-cinematic,serif)] text-base italic text-brand-gold/70 md:text-lg">
          Each night will not happen twice.
        </p>

        <div className="mt-10 md:mt-16">
          <ReserveCtaProminent />
        </div>
      </div>
    </section>
  );
}
