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

    const {
      emailNotifications,
      pushNotifications,
      likeNotifications,
      commentNotifications,
      followNotifications,
    } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : undefined,
        likeNotifications: likeNotifications !== undefined ? likeNotifications : undefined,
        commentNotifications: commentNotifications !== undefined ? commentNotifications : undefined,
        followNotifications: followNotifications !== undefined ? followNotifications : undefined,
      },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        likeNotifications: true,
        commentNotifications: true,
        followNotifications: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 