"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { saveApiKey } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function ApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() || !session?.user?.email) {
      toast.error("Missing required information");
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the server action to save the username and API key
      const result = await saveApiKey(
        session.user.email, 
        apiKey.trim(),
        organizationName
      );

      if (!result.success) {
        console.error("Error saving API key:", result.error);
        
        // Check if it's an RLS error
        if (result.error && (
          result.error.includes("Permission denied") || 
          result.error.includes("violates row-level security policy")
        )) {
          toast.error("Database permission error. Redirecting to setup instructions...");
          setTimeout(() => {
            router.push("/supabase-setup");
          }, 2000);
          return;
        }
        
        toast.error(`Failed to save API key: ${result.error || "Unknown error"}`);
        return;
      }

      // Check if a modified key was used (API key already existed for another org)
      if (result.note && result.note.includes("modified API key was used")) {
        toast.success("API key saved, but with a modified value because it was already in use by another organization.");
      } else if (result.updated) {
        toast.success("API key updated successfully!");
      } else {
        toast.success("API key saved successfully!");
      }
      
      console.log("Saved organization data:", result.data);
      
      // Redirect to home page after successful verification
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      
    } catch (error) {
      console.error("Error in API key verification:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
          type="text"
          value={organizationName}
          onChange={(e) =>  setOrganizationName(e.target.value)}
          className="mr-3 bg-[#1F1F1F] text-[#CECECE] border border-[#2E2E2E] rounded-md p-4 placeholder:text-[#B4B4B4] placeholder:text-sm focus:outline-[#148253] focus:border-[#148253] mt-6"
          placeholder="Enter your organization name"
        />
      <div className="input_wrapper flex flex-row items-center justify-between mt-3">
        <Input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mr-3 bg-[#1F1F1F] text-[#CECECE] border border-[#2E2E2E] rounded-md p-4 placeholder:text-[#B4B4B4] placeholder:text-sm focus:outline-[#148253] focus:border-[#148253]"
          placeholder="Paste your API Key here"
        />
        <Button
          type="submit"
          disabled={!apiKey.trim() || isLoading}
          className="bg-[#00623A] text-[#FAFAFA] border border-[#148253] font-semibold text-xs px-3 py-2 rounded-md flex flex-row items-center hover:bg-[#00623A]/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Verifying..." : "Verify API Key"}
        </Button>
      </div>
    </form>
  );
} 