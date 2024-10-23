import { removeSessionCookie } from "@/helpers/cookies"
import { NextResponse } from "next/server"

export const GET =async ()=>{
    try{
        const cookieStatus = await removeSessionCookie();
        if(cookieStatus.success){
            return NextResponse.json({
                success:true,
                msg:"Signed out successfully"
            })
        }
        return NextResponse.json({
            success:false,
            msg:"Failed to sign out"
        },{
            status:400
        })
    }catch{
        return NextResponse.json({
            success:false,
            msg:"Failed to sign out"
        },{
            status:400
        })
    }

}