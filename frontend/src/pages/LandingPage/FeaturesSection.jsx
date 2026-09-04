import FeaturesCard from "./FeatureCard";

const features = [
  {
    icon: "receipt_long",
    title: "Expense Tracking",
    description: ">Log shared bills instantly. See who paid what and keep the math transparent for everyone in the house.",
    positionclassName: "md:translate-y-4",
    animationclassName: "stagger-2",
  },
  {
    icon: "cleaning_services",
    title: "Chore Management",
    description: "Assign recurring tasks, set reminders, and rotate responsibilities so the home stays clean without the conflict.",
    positionclassName: "md:-translate-y-4",
    animationclassName: "stagger-3",
  },
  {
    icon: "account_balance_wallet",
    title: "Manage Debts",
    description: "Automatically calculate complex balances. Settle up seamlessly with clear records of all past transactions.",
    positionclassName: "md:translate-y-8",
    animationclassName: "stagger-4",
  },
];

function FeaturesSection (){
    return (
        <section className="bg-surface-container-lowest/40 backdrop-blur-sm px-container-margin py-lg md:py-16 flex flex-col gap-lg border-t border-outline-variant/20 mt-8" id="features">
          <div className="text-center mb-md max-w-2xl mx-auto fade-in-up-element stagger-1">
            <h2 className="font-headline-md md:font-headline-lg md:text-headline-lg text-headline-md text-on-surface">
              Everything you need, in one place
            </h2>
          </div>
          <div className="flex flex-col md:grid md:grid-cols-3 gap-md md:gap-lg max-w-7xl mx-auto">
            {features.map((feature) => {
                return (
                    <FeaturesCard 
                    {...feature}
                    key={feature.title}
                />
                )
            })}
          </div>
        </section>
    )
}

export default FeaturesSection