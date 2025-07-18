"use client";

import { Spinner } from "@/components/spinner";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plans";
import React, { useState } from "react";

// Fetch Subscription Status
async function fetchSubscriptionStatus() {
  const response = await fetch("/api/profile/subscription-status");
  if (!response.ok) {
    throw new Error("Failed to fetch subscription status");
  }
  return response.json();
}

// Udpate Plan Mutation
async function updatePlan(newPlan: string) {
  const response = await fetch("/api/profile/change-plan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newPlan }),
  });
  if (!response.ok) {
    throw new Error("Failed to update subscription plan");
  }
  return response.json();
}

export default function ProfilePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  
  // Get Subscription Status
  const { 
    data: subscriptionDetail, 
    isLoading, 
    isError, 
    error,
  } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: fetchSubscriptionStatus,
    enabled: isSignedIn && isLoaded,
    staleTime: 1000 * 60 * 5,
  });

  // Update user subscription plan using Mutation
  const { 
    data: updatedPlan,
    mutate: updatePlanMutation,
    isPending: isUpdatePlanPending,
    } = 
      useMutation({
        mutationFn: updatePlan,
    });

    // Get current Plan
  const currentPlan = availablePlans.find(
    (plan) => plan.interval === subscriptionDetail?.subscription?.subscriptionTier
  );

  // on btn click update plan
  const handleUpdatePlan = () => {
    if (!selectedPlan) {
      return;
    }
    console.log("Updating plan to:", selectedPlan);
    updatePlanMutation(selectedPlan);
    setSelectedPlan(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3 text-lg">Loading your profile...</span>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Please sign in to view your profile
        </h1>
        <p className="text-gray-600">
          You'll need to sign in to access your personal and subscription details
        </p>
      </div>
    );
  }
  
  return (    
    <div className="max-w-4xl mx-auto p-4 sm:p-6"> 
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h1>
        <p className="text-gray-600">Manage your account and subscription</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Personal Information
          </h2>
          
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            {user.imageUrl && (
              <div className="flex-shrink-0">
                <Image
                  src={user.imageUrl}
                  alt="User Profile Image"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-md"
                />
              </div>
            )}
            
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-semibold text-gray-800">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 mt-2">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Username:</span>
                  <span className="font-medium">
                    {user.username || "Not set"}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-gray-500 w-24">Joined:</span>
                  <span className="font-medium">
                    {user.createdAt?.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subscription Details Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Subscription Details
          </h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Spinner size="md" />
              <p className="mt-4 text-gray-600">Loading subscription details...</p>
            </div>
          ) : isError ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-700">
                Error loading subscription: {error.message}
              </p>
            </div>
          ) : currentPlan ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {currentPlan.name}
                  </h3>
                  <p className="text-gray-600">
                    {currentPlan.description}
                  </p>
                </div>
                
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium">
                    {currentPlan.interval}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {currentPlan.amount} {currentPlan.currency}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Subscription Tier:</span>
                  <span className="font-medium">
                    {subscriptionDetail.subscription.subscriptionTier}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Renewal Date:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Plan Subscription</h3>
                {currentPlan && (
                  <div className="space-y-4">
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                      defaultValue={currentPlan.interval} 
                      disabled={isUpdatePlanPending}
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => 
                        setSelectedPlan(event.target.value) 
                      }>
                      <option value="" disabled>Select a new plan</option>
                      {availablePlans.map((plan, key) => (
                        <option key={key} value={plan.interval}>
                          {plan.name} - {plan.amount} {plan.currency}
                        </option>
                      ))}
                    </select>
                    
                    <button 
                      onClick={handleUpdatePlan}
                      disabled={isUpdatePlanPending || !selectedPlan}
                      className={`
                        w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg transition
                        hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        disabled:opacity-70 disabled:cursor-not-allowed
                      `}
                    >
                      {isUpdatePlanPending ? 'Updating...' : 'Save Changes'}
                    </button>
                    
                    {isUpdatePlanPending && (
                      <div className="mt-3 flex items-center justify-center text-blue-600">
                        <Spinner size="sm" />
                        <span className="ml-2">Updating your plan...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have an active subscription plan
              </p>
              <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                Browse Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}