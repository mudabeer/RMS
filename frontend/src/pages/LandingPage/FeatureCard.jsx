function FeaturesCard({
  icon,
  title,
  description,
  positionclassName,
  animationclassName,
}) {
  return (
    <div className={`bg-surface/80 backdrop-blur-md rounded-[12px] p-lg shadow-level-1 border border-outline-variant/20 flex flex-col items-start gap-sm md:transform ${positionclassName} fade-in-up-element ${animationclassName} tactile-widget`}>
      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-xs">
        <span className="material-symbols-outlined" data-icon="receipt_long">
          {icon}
        </span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}

export default FeaturesCard