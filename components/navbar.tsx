"use client";
import Image from "next/image";
import Link from "next/link";
import {SignedIn, SignedOut, useUser} from '@clerk/nextjs';

export default function Navbar() {
  const {isLoaded, isSignedIn, user} = useUser();
  if(!isLoaded) return <p>loading...</p>;
  
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"  />
           </Link>
        </div>
        <div className="text-white text-lg font-bold">Meal Selection</div>
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="text-gray-300 hover:text-white">Home</a>
          </li>
          <li>
            <a href="/about" className="text-gray-300 hover:text-white">About</a>
          </li>
          <li>
            <a href="/contact" className="text-gray-300 hover:text-white">Contact</a>
          </li>
        </ul>
        <SignedIn>
          <li>
            {user? .imageUrl ? (<Link href="/profile"><Image src={user.imageUrl} alt="User icon" width={40} height={40} /></Link>) : <div></div>}
            
          </li>
          <li>
            <Link href="/sign-out" className="text-gray-300 hover:text-white">  Sign Out</Link>
          </li>
        </SignedIn>
        <SignedOut>
          <li>
            <Link href="/sign-in" className="text-gray-300 hover:text-white">Sign In</Link>
          </li>
          <li>
            <Link href="/sign-up" className="text-gray-300 hover:text-white">Sign Up</Link>
          </li>
        </SignedOut>
      </div>
    </nav>
  );
}