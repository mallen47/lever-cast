/**
 * Mock user data for prototype phase
 * In production, this would come from authentication/database
 */

import type { User } from "@/types";

export const mockUser: User = {
  id: "1",
  name: "John Entrepreneur",
  email: "john@example.com",
  avatar: "JE",
  platforms: {
    linkedin: {
      headline: "Founder & CEO | Tech Enthusiast",
    },
    x: {
      handle: "@johntech",
    },
  },
};
