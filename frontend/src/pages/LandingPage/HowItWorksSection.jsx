import Steps from "./steps";

const howItWorksSteps = [
    {
        number:'1',
        title:"Create a Group",
        description:"Invite your roommates to a shared space using a simple join link.",
        animationClassName:"stagger-2"
    },
    {
        number:'2',
        title:"Add Expenses & Tasks",
        description:"Start logging bills or creating chore schedules immediately.",
        animationClassName:"stagger-3"
    },
    {
        number:'3',
        title:"Stay in Sync",
        description:"Everyone sees real-time updates, balances, and notifications.",
        animationClassName:"stagger-4"
    }
]

function HowItWorksSection() {
  return (
    <section className="px-container-margin py-lg md:py-16 flex flex-col gap-lg bg-surface/40 backdrop-blur-sm mt-8 border-t border-outline-variant/20" id="how-it-works">
      <div className="text-center mb-md max-w-2xl mx-auto fade-in-up-element stagger-1">
        <h2 className="font-headline-md md:font-headline-lg md:text-headline-lg text-headline-md text-on-surface">
          How It Works
        </h2>
      </div>
      <div className="flex flex-col md:grid md:grid-cols-3 gap-md md:gap-lg relative max-w-7xl mx-auto w-full">
        <div className="absolute md:hidden left-6 top-6 bottom-6 w-[2px] bg-outline-variant/30"></div>
        <div className="hidden md:block absolute top-6 left-12 right-12 h-[2px] bg-outline-variant/30"></div>

        {
            howItWorksSteps.map((step) => {
                return (
                    <Steps 
                        key={step.number}
                        {...step}
                    />
                )
            })
        }

      </div>
    </section>
  );
}

export default HowItWorksSection