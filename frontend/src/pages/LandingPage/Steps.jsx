function Steps ({number,title,description,animationClassName}){
    return (
        <div className={`flex md:flex-col gap-md md:gap-sm relative z-10 md:items-center md:text-center fade-in-up-element ${animationClassName}`}>
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-on-primary font-headline-md text-headline-md flex items-center justify-center shadow-level-1 mx-auto tactile-widget">
            {number}
          </div>
          <div className="pt-sm pb-md md:pb-0">
            <h4 className="font-headline-md text-headline-md text-on-surface mb-xs">
              {title}
            </h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {description}
            </p>
          </div>
        </div>
    )
}

export default Steps