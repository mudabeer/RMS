import './AuthCard.css'

function AuthCard({childern,title,description}) {
    return (
        <div className="w-full md:w-1/2 auth-card p-lg md:p-[48px] max-w-[480px] mx-auto md:max-w-none mt-4">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
          {title}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {description}
        </p>
      </div>
    {childern}
    </div>
    )
}

export default AuthCard