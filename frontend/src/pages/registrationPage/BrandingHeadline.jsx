function BrandingHeadline() {
  return (
    <div className="w-full md:w-1/2 p-sm flex flex-col justify-center relative text-center md:text-left">
      <h1 className="font-display text-[36px] md:hidden text-primary mb-sm font-bold">
        RMS
      </h1>
      <h1 className="font-display text-[32px] md:text-[56px] leading-[1.1] font-bold tracking-tight text-on-surface mb-md">
        Fast, Efficient
        <br className="hidden md:block" /> and Productive
      </h1>
      <p className="font-body-lg text-[16px] md:text-[18px] leading-relaxed text-on-surface-variant mx-auto md:mx-0">
        Streamline your shared living experience today.
      </p>
    </div>
  );
}

export default BrandingHeadline;
