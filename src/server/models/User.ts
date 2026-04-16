import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "Manager" | "Team Member";
  avatar?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["Admin", "Manager", "Team Member"], 
    default: "Team Member" 
  },
  avatar: { type: String },
}, { timestamps: true });

userSchema.pre("save", async function() {
  const user = this as any;
  if (!user.isModified("password")) return;
  user.password = await bcrypt.hash(user.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, (this as any).password);
};

export default mongoose.model<IUser>("User", userSchema);
