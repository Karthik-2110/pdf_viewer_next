import { BoltIcon, BoltSlashIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button"
import { signIn } from "@/auth"
import { auth } from "@/auth"
import { signOut } from "@/auth"
import Image from 'next/image'
import ApiKeyForm from "@/components/ApiKeyForm";

export default async function Login() {
    const session = await auth()

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen bg-[#171717]">

                {
                    session ? (
                        <div className="login_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-2/4">
                            <div className="flex flex-row items-center justify-between">

                                <div className="flex flex-row items-center">
                                    <div className="icon_wrapper rounded-full mr-4">
                                        {session?.user?.image ? <Image
                                            src={session?.user?.image}
                                        width={42}
                                        height={42}
                                        alt="Picture of the author"
                                        className="rounded-full"
                                        /> : <BoltIcon className="size-4 text-[#ffffff]" />}
                                    </div>

                                    <div className="quantify_value flex flex-col items-start justify-center">
                                        <span className="text-[#CECECE] text-xl font-medium">{session?.user?.name}</span>
                                        <span className="text-[#B4B4B4] text-sm">{session?.user?.email}</span>
                                    </div>
                                </div>

                                <form
                                    action={async () => {
                                        "use server"
                                        await signOut()
                                    }}
                                >
                                    <Button type="submit" variant={"outline"} className="bg-[#1F1F1F] text-[#FAFAFA] border border-[#148253] font-semibold text-xs px-3 py-2 rounded-md flex flex-row items-center hover:bg-[#00623A]/30 hover:text-[#FAFAFA]">
                                        Sign out
                                    </Button>
                                </form>

                            </div>

                            <hr className="h-px my-4 bg-[#2E2E2E] border-0"/>

                            <div className="api_key_wrapper">
                                <h1 className="text-[#CECECE] text-lg font-medium">Get your Recruit CRM API Key</h1>
                                <p className="text-[#B4B4B4] text-sm mt-1">
                                    Please contact your administrator to get your Recruit CRM API Key.
                                </p>

                               <ApiKeyForm />
                                
                            </div>
                        </div>
                    ) : (
                        <div className="login_wrapper bg-[#1F1F1F] rounded-md p-4 border border-[#2E2E2E] w-2/4">
                            <div className="flex flex-row items-center justify-between">

                                <div className="flex flex-row items-center">
                                    <div className="icon_wrapper bg-[#09442C] rounded-md p-2 border border-[#148253] mr-4">
                                        <BoltIcon className="size-4 text-[#ffffff]" />
                                    </div>

                                    <div className="quantify_value flex flex-col items-start justify-center">
                                        <span className="text-[#CECECE] text-xl font-medium">Recruitcrm Automation</span>
                                        <span className="text-[#B4B4B4] text-sm">Use your organization gmail to login</span>
                                    </div>
                                </div>

                                <form
                                    action={async () => {
                                        "use server"
                                        await signIn("google")
                                    }}
                                >
                                    <Button type="submit" className="bg-[#00623A] text-[#FAFAFA] border border-[#148253] font-semibold text-xs px-3 py-2 rounded-md flex flex-row items-center hover:bg-[#00623A]/30">
                                        Sign in with Google
                                    </Button>
                                </form>

                            </div>
                        </div>
                    )
                }
            </div>
        </>
    )
}