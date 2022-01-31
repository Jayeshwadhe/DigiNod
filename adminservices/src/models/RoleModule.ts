import { IRole } from '@/interfaces/IRole';
import mongoose from 'mongoose';


const RoleModule = new mongoose.Schema(
  {
    path: {
      type: String,
      default: "/",
    },
    title: {
      type: String,
    },
    icon: {
      type: String,
    },
    submenu: [
      {
        path: String,
        title: String,
        icon: String,
      },
    ],
  },
  { timestamps: true }
);


export default mongoose.model<IRole & mongoose.Document>('RoleModule', RoleModule);


