import User from "../models/UserModel.js";

export const createAdminIfNotExists = async () =>{
    const EmailAdmin = 'admin@admin.com';
    const AdminPwd = 'admin123';
    const ExistAdmin = await User.findByEmail(EmailAdmin);
    if(!ExistAdmin)
    {
        await User.register({
              name : 'Admin',
              email : EmailAdmin ,
              password : AdminPwd,
              role : 'admin'
        });
        console.log('Admin created');
    }
    else
    {
        console.log('Admin already exists');
    }

};