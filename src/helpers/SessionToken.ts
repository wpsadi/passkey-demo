import { env } from '@/env';
import JWT from 'jsonwebtoken';
export const CreateSessionToken = async (userId:string)=>{
    try{
        const token = JWT.sign(
            {
                userId
            },
            env.jwt.secret,
            {
                expiresIn: "1d"
            }
        )
        return {
            success:true,
            token,
            msg:"Session token created"
        }
    }catch{
        return {
            success:false,
            token:null,
            msg:"Failed to create session token"
        }
    }
}


export const VerifySessionToken = async (token:string)=>{
    try{
        const decoded = JWT.verify(token,env.jwt.secret);
        return {
            success:true,
            payload:decoded,
            msg:"Session token verified"
        }
    }catch{
        return {
            success:false,
            payload:null,
            msg:"Failed to verify session token"
        }
    }
}