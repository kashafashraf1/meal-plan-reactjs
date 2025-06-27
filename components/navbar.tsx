"use client";
import Image from "next/image";
import Link from "next/link";
import {SignedIn, SignedOut, useUser, SignOutButton} from '@clerk/nextjs';

export default function Navbar() {
  const {isLoaded, isSignedIn, user} = useUser();
  if(!isLoaded) return <p>loading...</p>;
  
  return (
    <nav className="fixed bg-gray-800 top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Image
              className="cursor-pointer"
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
             />
           </Link>
          <div className="space-x-6 flex items-center">
            <SignedIn>
              <Link href="/mealplan" className="text-white hover:text-gray-300 transition">Meal Planner</Link>
              {user? .imageUrl ? (
                <Link href="/profile">
                  <Image src={user.imageUrl} alt="User icon" width={40} height={40} />
                </Link>
              ) : (
              <div></div>
              )
            }
              <SignOutButton>
                <button className="text-white cursor-pointer ml-4 px-4 py-2 rounded transition">Sign out</button>
              </SignOutButton>
            </SignedIn>
            <SignedOut>
              <Link href="/" className="text-white">Home</Link>
              <Link href={isSignedIn ? "/subscribe" : "sign-up"} className="text-white">Subscribe</Link>
              <Link href="/sign-up" className="text-white  bg-blue-600 rounded px-4 py-4 hover:bg-blue-500">Sign up</Link>
            </SignedOut>
        </div>
      </div>
    </nav>
  );
}