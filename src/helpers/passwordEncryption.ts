import bcrypt from 'bcryptjs';
export const encryptPassword = async (password: string) => {
    try{
        const salt = bcrypt.genSaltSync(10);
        
        const encryptedPassword = bcrypt.hashSync(password,salt);

        return {
            success:true,
            encryptedPassword,
            msg:"Password encrypted"
        }


    }catch{
        return {
            success:false,
            encryptedPassword:null,
            msg:"Failed to encrypt password"
        }
    }
}

export const comparePassword = async (password:string,encryptedPassword:string)=>{
    try{
        const isMatch = bcrypt.compareSync(password,encryptedPassword);
        return {
            success:true,
            isMatch,
            msg:"Password compared"
        }
    }catch{
        return {
            success:false,
            isMatch:false,
            msg:"Failed to compare password"
        }
    }
}