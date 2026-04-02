import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    alumniId: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      alumniId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    alumniId: string | null;
  }
}
