import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";

async function PatientsData() {
  const { getToken } = await auth();
  const token = await getToken();
  if (token) {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    console.log("Token claims:", payload);
  }
  
  console.log("Clerk token:", token ? "exists" : "NULL");
  const supabase = await createClient();
  const { data: patients, error } = await supabase.from("patients").select();
  return <pre>{JSON.stringify({ patients, error }, null, 2)}</pre>;
}

export default function TestPage() {
  return (
    <Suspense fallback={<div>Loading patients...</div>}>
      <PatientsData />
    </Suspense>
  );
}