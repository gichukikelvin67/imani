import mongoose from "mongoose";
const userSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
            minLength:2,
            maxLength:100,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            maxLength:200,
        },
        passwpordHash:{
            type:String,
            required:true,
            select:false,
        },
        phone:{
            type:Number,
            trim:true,
            maxlength:12,
            default:null,

        },
        role:{
            type:String,
            enum:[
                "customer",
                "seller",
                "driver",
                "business_manager",
                "admin",

            ],
            default:"customer",
            required:true,
        },
        emailVerified:{
            type:Boolean,
            default:true,
        },
    },
    {
        timestamps:true,
        versionKey:false,
    }
)
const User=mongoose.model("User",userSchema);
export default User;