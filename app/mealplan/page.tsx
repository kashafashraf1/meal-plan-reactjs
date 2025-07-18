"use client";

import { Spinner } from "@/components/spinner";
import { useMutation } from "@tanstack/react-query";

  interface MealPlanInput  {
    dietType: string;
    calories: number;
    allergies: string;
    cuisine: string;
    snacks: string;
    days?: number;
  }

  interface MealPlanResponse  {
    mealPlan?:  weeklyMealPlan;
    error?: string;
  }

  interface dailyMealPlan  {
    Breakfast?: string;
    Lunch?: string;
    Dinner?: string;
    Snacks?: string;
  };

  interface weeklyMealPlan  {
    [day: string]: dailyMealPlan;
  };

  async function fetchMealPlan(formDataInput: MealPlanInput) {
    const response = await fetch('/api/generate-mealplan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formDataInput),
    }); 
    if (!response.ok) {
      console.error(response);
      throw new Error('Failed to generate meal plan');
    }
    return response.json();
  }


  export default function MealPlanPage() {
  
    const {mutate, isPending, data, isSuccess} = useMutation<MealPlanResponse, Error, MealPlanFormDataInput>({
      mutationFn: fetchMealPlan,
      onSuccess: (data) => {
        if (data.error) {
          console.error("Error generating meal plan:", data.error);
        } else {
          console.log("Generated Meal Plan:", data.mealPlan);
        }
      },
      onError: (error) => {
        console.error("Error in mutation:", error.message);
      },
    });



    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const payload: MealPlanInput = {
        dietType: formData.get('dietType')?.toString() || '',
        calories: Number(formData.get('calories')) || 2000,
        allergies: formData.get('allergies')?.toString() || '',
        cuisine: formData.get('cuisine')?.toString() || '',
        snacks: formData.get('snacks')?.toString() || "",
        days: 7, // Default to 7 days
      }
      console.log("Meal Plan Form Data:", payload);
      mutate(payload);
    }

    if(data) {
      console.log("Meal Plan Data:", data);
    }

 return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800">AI-Powered Meal Planning</h1>
        <p className="text-gray-600 mt-2">Customize your preferences and generate your perfect meal plan</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="w-full lg:w-1/2 bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dietType" className="block text-sm font-medium text-gray-700 mb-1">
                Diet Type
              </label>
              <select
                id="dietType"
                name="dietType"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
                <option value="gluten-free">Gluten-Free</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Calories
                </label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  min="800"
                  max="5000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 2000"
                />
              </div>

            </div>

            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies or Restrictions
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. nuts, dairy, shellfish"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Cuisines
                </label>
                <input
                  type="text"
                  id="cuisine"
                  name="cuisine"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Italian, Mexican, Asian"
                />
              </div>

              <div>
                <label htmlFor="snacks" className="block text-sm font-medium text-gray-700 mb-1">
                  Include Snacks?
                </label>
                <input
                  id="snacks"
                  name="snacks"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />  
              </div>

            </div>


            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {isPending? "Generating..." : "Genarate Meal Plan" }
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Results */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Meal Plan Results</h2>
            
            <div className="flex flex-col items-center justify-center h-64 text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Meal Plan Results Will Appear Here</h3>
              <p className="text-gray-600">
                {data?.mealPlan && isSuccess ? (
                  <div></div>
                ) : isPending ? (
                  <Spinner />
                ) : (
                  <p>Please generate your meal plan</p>
                )
                 }
               
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) }