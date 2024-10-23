import { getAccountFromCookie } from "@/helpers/cookies"
import { getAccountFromId } from "@/helpers/getAccountFromId";
import { NextResponse } from "next/server"

export const GET = async ()=>{
    try{
        const cookieStatus = (await getAccountFromCookie());
        if (!cookieStatus.success) {
            return NextResponse.json({
                success:true,
                msg:cookieStatus.msg
            },{
                status:400
            })
        }
        const userId = cookieStatus!.userId as string;

        // getting account
        const accountStatus = (await getAccountFromId(userId));
       if (!accountStatus.success){
              return NextResponse.json({
                success:true,
                account:null,
                msg:accountStatus.msg
              },{
                    status:400
              })
       }

         const account = accountStatus.account;



        return NextResponse.json({
            success:true,
            userId,
            account,
        })
    }catch{
        return NextResponse.json({
            success:false,
            msg:"Internal Error Occured"
        },{
            status:500
        })
    }
}