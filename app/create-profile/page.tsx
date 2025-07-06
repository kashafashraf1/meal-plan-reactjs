"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = {
    message?: string;
    error?: string;
};

async function createProfile(): Promise<ApiResponse> {
    const response = await fetch("/api/create-profile", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
        }, 
    });

    const resData = await response.json();
    return resData as ApiResponse;

}       

export default function CreateProfilePage() {
    
    const { isLoaded, isSignedIn} = useUser();
    const router = useRouter();
    const {mutate, isPending} = useMutation<ApiResponse, Error >({   
        mutationFn: createProfile,
        onSuccess: (data) => {
            if (data.error) {
                console.error("Error creating profile:", data.error);
            } else {
                console.log("Profile created successfully:", data.message);
                router.push("/subscribe page"); // Redirect to subscribe page once profile is created
            }
        },
        onError: (error) => {
            console.error("Error creating profile:", error.message);
        },
    });   
    
    useEffect(() => {
        if (isLoaded && isSignedIn && !isPending) {
            mutate();
        }
    }, [isLoaded, isSignedIn]);

    return "<div>Signing up...</p>";
}