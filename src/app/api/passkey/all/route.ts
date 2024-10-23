import { getUserPasskeys } from "@/helpers/getUserPasskeys";
import { makeSureAccountExistFromCookie } from "@/helpers/makeSureAccountExistFromCookie";
import { NextResponse } from "next/server"
import { Models } from "node-appwrite";

export const GET = async ()=>{
    try{
        const accountStatus = await makeSureAccountExistFromCookie();

        if (!accountStatus.success) {
          return NextResponse.json(
            {
              success: true,
              msg: accountStatus.msg,
            },
            {
              status: 400,
            }
          );
        }
    
        const account = accountStatus.account as unknown as (Models.Database & {
            email: string;
            username: string;
        });
    
        // gettng userPasskeys
        const passkeysStatus = await getUserPasskeys(account!.$id);
    
        if (!passkeysStatus.success) {
          return NextResponse.json(
            {
              success: false,
              msg: passkeysStatus.msg,
            },
            {
              status: 500,
            }
          );
        }
        // const passkeys = passkeysStatus.passkeys as unknown as  {
        //    $id:string
        //     passkey:string
        // }[];
        const msg = passkeysStatus.msg
        

        return NextResponse.json({
            success:true,
            keys:{
                passkeys:passkeysStatus.passkeys,
                total:passkeysStatus.total
            },

            msg
        },{
            status:200
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