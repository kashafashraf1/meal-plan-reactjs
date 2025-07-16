"use client";

import { availablePlans } from '@/lib/plans';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast, {Toaster} from 'react-hot-toast';



type SubscribeResponse = {
  url: string;
}

type SubscribeError = {
  error: string;
}


const subscribeToPlan = async ({
  planType,
  userId,
  email,
}: {
  planType: string;
  userId: string;
  email: string;
}): Promise<SubscribeResponse> => {
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },    
    body: JSON.stringify({
      planType,
      userId,
      email,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to subscribe');
  }

  const data: SubscribeResponse = await response.json();
  console.log("Subscription response data:", data);
  return data

}
export default function SubscribePage() {
  const { user } = useUser();
  const router = useRouter();
  const userId = user?.id || '';
  const email = user?.emailAddresses[0]?.emailAddress || '';

  const {mutate, isPending} = useMutation < 
    SubscribeResponse, 
    SubscribeError, 
    { planType: string }
    >({
    mutationFn: async ({planType}) => {
      console.log("Mutating with planType:", planType);
      if(!userId){
        throw new Error("User ID not signed");
      }
    
      console.log("Subscribing to plan:", planType, "for user:", userId, "with email:", email);
      return subscribeToPlan({planType, userId, email});
    },
    onMutate: () => {     
      toast.loading('Processing subscription...');  
    },
    onSuccess: (data) => {
      toast.success('Subscription successful! Redirecting to payment...');
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        console.error("No URL returned from subscription API");
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
      toast.error('Failed to subscribe. Please try again.');
    }

  });
  
  function handlePlanSelection(planType: string) {
    console.log("Selected plan type:", planType);
    if(!userId) {
      router.push('/sign-up'); // Redirect to profile creation if user is not signed in
      return
    }
    console.log("2 Selected plan type:", planType);
    mutate({ planType });
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800">Meal Plan Pricing</h1>
        <p className="text-gray-600 mt-2">Choose the perfect plan for your nutrition journey</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {availablePlans.map((plan) => (
          <div 
            key={plan.name}
            className={`border rounded-lg p-6 shadow-sm transition-all hover:shadow-md
              ${plan.isPopular 
                ? "border-2 border-blue-500 ring-2 ring-blue-100 transform -translate-y-1" 
                : "border-gray-200"}`}
          >
            {plan.isPopular && (
              <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                POPULAR
              </div>
            )}
            
            <h2 className="text-xl font-semibold text-gray-800">{plan.name}</h2>
            <p className="text-gray-600 mt-2">{plan.description}</p>
            
            <div className="my-6">
              <span className="text-3xl font-bold">
                {plan.amount} {plan.currency}
              </span>
              <span className="text-gray-500">/{plan.interval}</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button className={`w-full py-2 px-4 rounded-md font-medium ${
              plan.isPopular 
                ? "bg-blue-500 hover:bg-blue-600 text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
            onClick={() => handlePlanSelection(plan.interval)}
            disabled={isPending}
            >
              {isPending ? 'Processing...' : `Select ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}