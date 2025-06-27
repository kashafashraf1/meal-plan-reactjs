import Image from "next/image";
import Link from "next/link";
import { RocketIcon, PuzzleIcon, SmileIcon } from "lucide-react"; // Example icons

export default function Home() {
  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 max-w-7xl mx-auto ">
      
      {/* Hero Section */}
      <section className="text-center bg-gradient-to-r from-emra-100 to-blue-200 mb-12 p-8">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          Get AI to plan your meals and generate recipes
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          You just need to tell us what you like, and we will generate a meal plan for you.
        </p>
        <Link href="/get-started" className="inline-block bg-blue-600 text-white text-lg font-medium px-6 py-3 rounded-full shadow hover:bg-blue-700 transition">
            Get Started
        </Link>
      </section>

      {/* HOW IT WORKS Section */}
      <section className="text-center mb-12 ">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-2">
          HOW IT WORKS
        </h2>
        <p className="text-gray-600 mb-12">
          A simple three-step process to get you started
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center px-6">
            <RocketIcon className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step 1: Sign Up</h3>
            <p className="text-gray-500">
              Create an account and join our growing community.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center px-6">
            <PuzzleIcon className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step 2: Set Preferences</h3>
            <p className="text-gray-500">
              Add your dietary preferences to tailor your meal plan.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center px-6">
            <SmileIcon className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Step 3: Get Meal Plan</h3>
            <p className="text-gray-500">
              Get your meal plan weekly.
            </p>
          </div>
        </div>
      </section>


    </div>
  );
}