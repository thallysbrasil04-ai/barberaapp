import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      phone: string;
      barberId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    phone: string;
    barberId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    phone: string;
    barberId: string | null;
  }
}
