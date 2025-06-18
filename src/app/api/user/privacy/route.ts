import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileVisibility, searchVisibility, activityVisibility } = await request.json();

    // Validate input
    if (profileVisibility && !["public", "private"].includes(profileVisibility)) {
      return NextResponse.json(
        { error: "Invalid profile visibility value" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        profileVisibility: profileVisibility || undefined,
        searchVisibility: searchVisibility !== undefined ? searchVisibility : undefined,
        activityVisibility: activityVisibility !== undefined ? activityVisibility : undefined,
      },
      select: {
        profileVisibility: true,
        searchVisibility: true,
        activityVisibility: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 